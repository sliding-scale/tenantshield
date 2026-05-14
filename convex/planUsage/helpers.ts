import type { MutationCtx } from "../_generated/server"
import type { Id } from "../_generated/dataModel"
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

// ── Reads ────────────────────────────────────────────────────────────────────

export async function getPlanUsageForUser(ctx: MutationCtx, clerkId: string) {
  const [user, planUsage] = await Promise.all([
    ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId)).unique(),
    ctx.db.query("planUsage").withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId)).first(),
  ])

  const plan = (user?.plan ?? "free") as PlanId
  const planType = (planUsage?.planType ?? "monthly") as BillingPeriod

  return { plan, planType, planUsage }
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

  const used = planUsage?.usedActiveCases ?? 0
  const limit = getActiveCaseLimit(plan, planType)
  if (used >= limit) throw new Error(ACTIVE_CASE_LIMIT_REACHED)
}

export async function assertCanActivateCase(
  ctx: MutationCtx,
  clerkId: string,
  _caseId: Id<"cases">,
) {
  const { plan, planType, planUsage } = await getPlanUsageForUser(ctx, clerkId)
  const used = planUsage?.usedActiveCases ?? 0
  const limit = getActiveCaseLimit(plan, planType)
  if (used >= limit) throw new Error(ACTIVE_CASE_LIMIT_REACHED)
}

export async function assertCanCreateLetter(ctx: MutationCtx, clerkId: string) {
  const { plan, planType, planUsage } = await getPlanUsageForUser(ctx, clerkId)
  if (plan === "free") return
  const used = planUsage?.usedLetters ?? 0
  const limit = PLAN_LIMITS[plan][planType].letters
  if (used >= limit) throw new Error(LETTER_LIMIT_REACHED)
}

export async function assertCanCreateLeaseAnalysis(ctx: MutationCtx, clerkId: string) {
  const { plan, planType, planUsage } = await getPlanUsageForUser(ctx, clerkId)
  if (plan === "free") return
  const used = planUsage?.usedLeaseAnalyses ?? 0
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

export const incrementUsedLetters = (ctx: MutationCtx, clerkId: string) =>
  adjustCounter(ctx, clerkId, "usedLetters", 1)

export const incrementUsedLeaseAnalyses = (ctx: MutationCtx, clerkId: string) =>
  adjustCounter(ctx, clerkId, "usedLeaseAnalyses", 1)
