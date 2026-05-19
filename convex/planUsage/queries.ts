import { internalQuery, query } from "../_generated/server"
import { v } from "convex/values"

export const stripeCustomerForClerk = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const planUsage = await ctx.db
      .query("planUsage")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()
    if (planUsage?.stripeCustomerId) {
      return planUsage.stripeCustomerId
    }
    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_clerk_id_active", (q) =>
        q.eq("clerkId", args.clerkId).eq("isActive", true),
      )
      .first()
    return subscription?.stripeCustomerId ?? null
  },
})

/**
 * Prefer Customer Portal / plan changes when the user already has a non-canceling paid subscription.
 */
export const checkoutShouldUsePortalInstead = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const planUsage = await ctx.db
      .query("planUsage")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    if (
      planUsage &&
      planUsage.plan !== "free" &&
      planUsage.cancelAtPeriodEnd !== true
    ) {
      return {
        blocked: true as const,
        message:
          "You already have an active subscription. Use Manage billing to change or cancel your plan.",
      }
    }

    const sub = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_clerk_id_active", (q) =>
        q.eq("clerkId", args.clerkId).eq("isActive", true),
      )
      .first()

    if (!sub) {
      return { blocked: false as const, message: "" }
    }

    if (sub.cancelAtPeriodEnd === true) {
      return { blocked: false as const, message: "" }
    }

    if (sub.subscriptionStatus === "canceled") {
      return { blocked: false as const, message: "" }
    }

    if (sub.tier === "pro" || sub.tier === "power") {
      return {
        blocked: true as const,
        message:
          "You already have an active subscription. Use Manage billing to change or cancel your plan.",
      }
    }

    return { blocked: false as const, message: "" }
  },
})

/**
 * Unified subscription + usage snapshot for UI. Plan and cancellation come from `planUsage` /
 * `userSubscriptions` first; stale `users.plan` without billing rows is treated as free.
 * When paid access is expected but `planUsage` is missing, `usageSyncPending` is true.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const [user, planUsage, activeSubscription] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique(),
      ctx.db
        .query("planUsage")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first(),
      ctx.db
        .query("userSubscriptions")
        .withIndex("by_clerk_id_active", (q) =>
          q.eq("clerkId", identity.subject).eq("isActive", true),
        )
        .first(),
    ])

    const effectivePlan = (planUsage?.plan ??
      activeSubscription?.tier ??
      user?.plan ??
      "free") as "free" | "pro" | "power"

    let plan: "free" | "pro" | "power" = effectivePlan
    if (
      (effectivePlan === "pro" || effectivePlan === "power") &&
      !planUsage &&
      !activeSubscription
    ) {
      plan = "free"
    }

    const planType = (planUsage?.planType ??
      activeSubscription?.planType ??
      "monthly") as "monthly" | "yearly"

    const cancelAtPeriodEnd =
      planUsage?.cancelAtPeriodEnd === true || activeSubscription?.cancelAtPeriodEnd === true
    const currentPeriodEnd = planUsage?.currentPeriodEnd ?? activeSubscription?.currentPeriodEnd

    const usageSyncPending =
      plan !== "free" && planUsage === undefined && activeSubscription !== null

    const usageCountersReliable = plan === "free" || planUsage !== null

    return {
      plan,
      planType,
      usedActiveCases: planUsage?.usedActiveCases ?? 0,
      usedLetters: planUsage?.usedLetters ?? 0,
      usedLeaseAnalyses: planUsage?.usedLeaseAnalyses ?? 0,
      usageCountersReliable,
      usageSyncPending,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    }
  },
})
