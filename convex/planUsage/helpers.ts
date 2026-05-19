import type { MutationCtx } from "../_generated/server"
import type { Doc, Id } from "../_generated/dataModel"
import {
  PLAN_LIMITS,
  getActiveCaseLimit,
  type BillingPeriod,
  type PlanId,
} from "../../lib/plans/plans"
import {
  ACTIVE_CASE_LIMIT_REACHED,
  FREE_CASE_LIMIT_REACHED,
  LETTER_LIMIT_REACHED,
  LEASE_ANALYSIS_LIMIT_REACHED,
} from "../../lib/plans/plan-access"

import { usageMonthKeyEastern } from "./usageMonthKey"

// ── Reads ────────────────────────────────────────────────────────────────────

export async function getPlanUsageForUser(ctx: MutationCtx, clerkId: string) {
  const [user, planUsage] = await Promise.all([
    ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId)).unique(),
    ctx.db.query("planUsage").withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId)).first(),
  ])
  const activeSubscription = await ctx.db
    .query("userSubscriptions")
    .withIndex("by_clerk_id_active", (q) => q.eq("clerkId", clerkId).eq("isActive", true))
    .first()

  const effectivePlan = (planUsage?.plan ??
    activeSubscription?.tier ??
    user?.plan ??
    "free") as PlanId

  let plan: PlanId = effectivePlan
  if ((effectivePlan === "pro" || effectivePlan === "power") && !planUsage && !activeSubscription) {
    plan = "free"
  }

  const planType = (planUsage?.planType ?? activeSubscription?.planType ?? "monthly") as BillingPeriod

  return { plan, planType, planUsage, activeSubscription }
}

const SUBSCRIPTION_SYNCING =
  "Your subscription is still syncing. Please wait a moment and try again."

function assertPaidHasUsageRow(plan: PlanId, planUsage: Doc<"planUsage"> | null) {
  if (plan !== "free" && planUsage === null) {
    throw new Error(SUBSCRIPTION_SYNCING)
  }
}

/** Lazy reset for letter/lease quotas only (yearly: NY calendar month; monthly: Stripe period). */
export async function ensureLetterLeaseQuotaWindow(ctx: MutationCtx, clerkId: string) {
  const { plan, planType, planUsage } = await getPlanUsageForUser(ctx, clerkId)
  if (!planUsage || plan === "free") return

  if (planType === "yearly") {
    const key = usageMonthKeyEastern(Date.now())
    if (planUsage.usageQuotaMonthKey === undefined) {
      await ctx.db.patch(planUsage._id, { usageQuotaMonthKey: key })
      return
    }
    if (planUsage.usageQuotaMonthKey !== key) {
      await ctx.db.patch(planUsage._id, {
        usedLetters: 0,
        usedLeaseAnalyses: 0,
        usageQuotaMonthKey: key,
      })
    }
    return
  }

  const periodStart = planUsage.currentPeriodStart
  const anchor = planUsage.usageStripePeriodStart
  if (anchor === undefined) {
    await ctx.db.patch(planUsage._id, { usageStripePeriodStart: periodStart })
    return
  }
  if (anchor !== periodStart) {
    await ctx.db.patch(planUsage._id, {
      usedLetters: 0,
      usedLeaseAnalyses: 0,
      usageStripePeriodStart: periodStart,
    })
  }
}

// ── Guards ───────────────────────────────────────────────────────────────────

export async function assertCanCreateCase(ctx: MutationCtx, clerkId: string) {
  const { plan, planType, planUsage } = await getPlanUsageForUser(ctx, clerkId)

  if (plan === "free") {
    const existingCount = await ctx.db
      .query("cases")
      .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
      .collect()
    if (existingCount.length > 0) throw new Error(FREE_CASE_LIMIT_REACHED)
    return
  }

  assertPaidHasUsageRow(plan, planUsage)

  const used = planUsage!.usedActiveCases
  const limit = getActiveCaseLimit(plan, planType)
  if (used >= limit) throw new Error(ACTIVE_CASE_LIMIT_REACHED)
}

export async function assertCanActivateCase(
  ctx: MutationCtx,
  clerkId: string,
  caseId: Id<"cases">,
) {
  void caseId
  const { plan, planType, planUsage } = await getPlanUsageForUser(ctx, clerkId)
  if (plan !== "free") {
    assertPaidHasUsageRow(plan, planUsage)
  }
  const used = plan !== "free" ? planUsage!.usedActiveCases : (planUsage?.usedActiveCases ?? 0)
  const limit = getActiveCaseLimit(plan, planType)
  if (used >= limit) throw new Error(ACTIVE_CASE_LIMIT_REACHED)
}

export async function assertCanCreateLetter(ctx: MutationCtx, clerkId: string) {
  await ensureLetterLeaseQuotaWindow(ctx, clerkId)
  const { plan, planType, planUsage } = await getPlanUsageForUser(ctx, clerkId)
  if (plan === "free") return
  assertPaidHasUsageRow(plan, planUsage)
  const used = planUsage!.usedLetters
  const limit = PLAN_LIMITS[plan][planType].letters
  if (used >= limit) throw new Error(LETTER_LIMIT_REACHED)
}

export async function assertCanCreateLeaseAnalysis(ctx: MutationCtx, clerkId: string) {
  await ensureLetterLeaseQuotaWindow(ctx, clerkId)
  const { plan, planType, planUsage } = await getPlanUsageForUser(ctx, clerkId)
  if (plan === "free") return
  assertPaidHasUsageRow(plan, planUsage)
  const used = planUsage!.usedLeaseAnalyses
  const limit = PLAN_LIMITS[plan][planType].leaseAnalyses
  if (used >= limit) throw new Error(LEASE_ANALYSIS_LIMIT_REACHED)
}

// ── Counters ─────────────────────────────────────────────────────────────────

async function adjustCounter(
  ctx: MutationCtx,
  clerkId: string,
  counter: "usedActiveCases" | "usedLeaseAnalyses" | "usedLetters",
  delta: number,
) {
  const { planUsage } = await getPlanUsageForUser(ctx, clerkId)
  if (!planUsage) return
  await ctx.db.patch(planUsage._id, {
    [counter]: Math.max(0, planUsage[counter] + delta),
  })
}

export const adjustUsedActiveCases = (ctx: MutationCtx, clerkId: string, delta: number) =>
  adjustCounter(ctx, clerkId, "usedActiveCases", delta)

export const incrementUsedLetters = async (ctx: MutationCtx, clerkId: string) => {
  await ensureLetterLeaseQuotaWindow(ctx, clerkId)
  return adjustCounter(ctx, clerkId, "usedLetters", 1)
}

export const incrementUsedLeaseAnalyses = async (ctx: MutationCtx, clerkId: string) => {
  await ensureLetterLeaseQuotaWindow(ctx, clerkId)
  return adjustCounter(ctx, clerkId, "usedLeaseAnalyses", 1)
}
