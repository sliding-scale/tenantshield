import { v } from "convex/values"
import { mutation, type MutationCtx } from "../_generated/server"

const BillingPeriod = v.union(v.literal("monthly"), v.literal("yearly"))
const PaidPlan = v.union(v.literal("pro"), v.literal("power"))

type PaidPlanId = "pro" | "power"

function getPeriodEnd(start: number, planType: "monthly" | "yearly") {
  const days = planType === "yearly" ? 365 : 30
  return start + days * 24 * 60 * 60 * 1000
}

async function syncFirstPaidPlanEntitlements(
  ctx: MutationCtx,
  clerkId: string,
  plan: PaidPlanId,
) {
  const [cases, letters, leases] = await Promise.all([
    ctx.db
      .query("cases")
      .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("letters")
      .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
      .collect(),
    ctx.db
      .query("leases")
      .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
      .collect(),
  ])

  await Promise.all([
    ...cases.map((row) => ctx.db.patch(row._id, { createdUnderPlan: plan })),
    ...letters.map((row) => ctx.db.patch(row._id, { createdUnderPlan: plan })),
    ...leases.map((row) => ctx.db.patch(row._id, { createdUnderPlan: plan })),
  ])

  return {
    usedActiveCases: cases.filter((row) => (row.caseStatus ?? "active") === "active").length,
    usedLeaseAnalyses: leases.length,
    usedLetters: letters.length,
  }
}

export const selectPlanForCurrentUser = mutation({
  args: {
    plan: PaidPlan,
    planType: BillingPeriod,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, { plan: args.plan })

    const existingPlanUsage = await ctx.db
      .query("planUsage")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    const now = Date.now()
    const usage = existingPlanUsage
      ? {
          usedActiveCases: existingPlanUsage.usedActiveCases,
          usedLeaseAnalyses: existingPlanUsage.usedLeaseAnalyses,
          usedLetters: existingPlanUsage.usedLetters,
        }
      : await syncFirstPaidPlanEntitlements(ctx, identity.subject, args.plan)

    const planUsageFields = {
      clerkId: identity.subject,
      plan: args.plan,
      planType: args.planType,
      subscriptionStatus: "active" as const,
      currentPeriodStart: now,
      currentPeriodEnd: getPeriodEnd(now, args.planType),
      ...usage,
    }

    if (existingPlanUsage) {
      await ctx.db.patch(existingPlanUsage._id, planUsageFields)
      return existingPlanUsage._id
    }

    return await ctx.db.insert("planUsage", planUsageFields)
  },
})
