import { internalMutation } from "../_generated/server"
import { v } from "convex/values"
import { syncFirstPaidPlanEntitlements } from "../planUsage/entitlements"
import type { PaidPlanId } from "../planUsage/types"
import { usageMonthKeyEastern } from "../planUsage/usageMonthKey"

function mapStripeStatus(
  status: string,
): "active" | "canceled" | "past_due" | "trialing" {
  switch (status) {
    case "active":
    case "paused":
      return "active"
    case "trialing":
      return "trialing"
    case "past_due":
      return "past_due"
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled"
    case "incomplete":
      return "canceled"
    default:
      return "canceled"
  }
}

function grantsPaidAccess(status: string): boolean {
  return (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "paused"
  )
}

export const applyStripeSubscription = internalMutation({
  args: {
    clerkId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    plan: v.union(v.literal("pro"), v.literal("power")),
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
    stripeStatus: v.string(),
    currentPeriodStartMs: v.number(),
    currentPeriodEndMs: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.currentPeriodStartMs) || !Number.isFinite(args.currentPeriodEndMs)) {
      console.warn(
        "applyStripeSubscription: non-finite period bounds — refusing to write",
        args.currentPeriodStartMs,
        args.currentPeriodEndMs,
        args.stripeSubscriptionId,
      )
      return
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()
    if (!user) {
      console.warn("applyStripeSubscription: user not found", args.clerkId)
      return
    }

    const mapped = mapStripeStatus(args.stripeStatus)
    const shouldHavePaidPlan = grantsPaidAccess(args.stripeStatus)

    const subscriptionRowFields = {
      clerkId: args.clerkId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      tier: args.plan,
      planType: args.billingPeriod,
      subscriptionStatus: mapped,
      currentPeriodStart: args.currentPeriodStartMs,
      currentPeriodEnd: args.currentPeriodEndMs,
      stripePriceId: args.stripePriceId || undefined,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      isActive: shouldHavePaidPlan,
    }

    const rowsForStripeSub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_stripe_subscription_id", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .collect()

    const sortedStripeRows = [...rowsForStripeSub].sort(
      (a, b) => b._creationTime - a._creationTime,
    )
    const primaryStripeRow = sortedStripeRows[0]
    for (const duplicate of sortedStripeRows.slice(1)) {
      await ctx.db.delete(duplicate._id)
    }

    const clerkSubs = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect()

    for (const row of clerkSubs) {
      if (row.stripeSubscriptionId === args.stripeSubscriptionId) continue
      if (!row.isActive) continue
      await ctx.db.patch(row._id, { isActive: false })
    }

    if (!shouldHavePaidPlan) {
      await ctx.db.patch(user._id, { plan: "free" })
      if (primaryStripeRow) {
        await ctx.db.patch(primaryStripeRow._id, {
          ...subscriptionRowFields,
          isActive: false,
          subscriptionStatus: "canceled",
          cancelAtPeriodEnd: false,
        })
      }
      for (const row of clerkSubs) {
        if (row._id === primaryStripeRow?._id) continue
        await ctx.db.patch(row._id, {
          isActive: false,
          subscriptionStatus: "canceled",
          cancelAtPeriodEnd: false,
        })
      }
      const existingUsage = await ctx.db
        .query("planUsage")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first()
      if (existingUsage) await ctx.db.delete(existingUsage._id)
      return
    }

    const plan = args.plan as PaidPlanId
    await ctx.db.patch(user._id, { plan })

    const existingPlanUsage = await ctx.db
      .query("planUsage")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    let usedActiveCases: number
    let usedLeaseAnalyses: number
    let usedLetters: number

    const prevPeriodStart = existingPlanUsage?.currentPeriodStart
    const periodChanged =
      existingPlanUsage !== undefined &&
      args.billingPeriod === "monthly" &&
      prevPeriodStart !== undefined &&
      prevPeriodStart !== args.currentPeriodStartMs

    const sameStripeSubscription =
      existingPlanUsage?.stripeSubscriptionId === args.stripeSubscriptionId

    if (!existingPlanUsage) {
      const ent = await syncFirstPaidPlanEntitlements(ctx, args.clerkId, plan)
      usedActiveCases = ent.usedActiveCases
      usedLeaseAnalyses = ent.usedLeaseAnalyses
      usedLetters = ent.usedLetters
    } else if (!existingPlanUsage.stripeSubscriptionId) {
      const ent = await syncFirstPaidPlanEntitlements(ctx, args.clerkId, plan)
      usedActiveCases = ent.usedActiveCases
      usedLeaseAnalyses = ent.usedLeaseAnalyses
      usedLetters = ent.usedLetters
    } else if (sameStripeSubscription) {
      usedActiveCases = existingPlanUsage.usedActiveCases
      if (periodChanged) {
        usedLeaseAnalyses = 0
        usedLetters = 0
      } else {
        usedLeaseAnalyses = existingPlanUsage.usedLeaseAnalyses
        usedLetters = existingPlanUsage.usedLetters
      }
    } else {
      usedActiveCases = existingPlanUsage.usedActiveCases
      usedLeaseAnalyses = 0
      usedLetters = 0
    }

    const usageQuotaMonthKey =
      args.billingPeriod === "yearly" ? usageMonthKeyEastern(Date.now()) : undefined

    const usageStripePeriodStart =
      args.billingPeriod === "monthly" ? args.currentPeriodStartMs : undefined

    const planUsageFields = {
      clerkId: args.clerkId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      plan,
      planType: args.billingPeriod,
      subscriptionStatus: mapped,
      currentPeriodStart: args.currentPeriodStartMs,
      currentPeriodEnd: args.currentPeriodEndMs,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      usageQuotaMonthKey,
      usageStripePeriodStart,
      usedActiveCases,
      usedLeaseAnalyses,
      usedLetters,
    }

    if (existingPlanUsage) {
      await ctx.db.patch(existingPlanUsage._id, planUsageFields)
    } else {
      await ctx.db.insert("planUsage", planUsageFields)
    }

    if (primaryStripeRow) {
      await ctx.db.patch(primaryStripeRow._id, {
        ...subscriptionRowFields,
        tier: plan,
        isActive: true,
      })
    } else {
      await ctx.db.insert("userSubscriptions", {
        ...subscriptionRowFields,
        tier: plan,
        isActive: true,
      })
    }
  },
})
