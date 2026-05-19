import { internalQuery, query } from "../_generated/server"
import { v } from "convex/values"

export const stripeCustomerForClerk = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_clerk_id_active", (q) =>
        q.eq("clerkId", args.clerkId).eq("isActive", true),
      )
      .first()
    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId
    }
    const planUsage = await ctx.db
      .query("planUsage")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()
    return planUsage?.stripeCustomerId ?? null
  },
})

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const planUsage = await ctx.db
      .query("planUsage")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    const activeSubscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_clerk_id_active", (q) =>
        q.eq("clerkId", identity.subject).eq("isActive", true),
      )
      .first()

    if (!planUsage && !activeSubscription) return null

    const cancelAtPeriodEnd =
      planUsage?.cancelAtPeriodEnd === true || activeSubscription?.cancelAtPeriodEnd === true
    const currentPeriodEnd =
      planUsage?.currentPeriodEnd ?? activeSubscription?.currentPeriodEnd

    if (!planUsage) {
      if (!activeSubscription) return null
      return {
        plan: activeSubscription.tier,
        planType: activeSubscription.planType,
        usedActiveCases: 0,
        usedLetters: 0,
        usedLeaseAnalyses: 0,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      }
    }

    return {
      plan: planUsage.plan,
      planType: planUsage.planType,
      usedActiveCases: planUsage.usedActiveCases,
      usedLetters: planUsage.usedLetters,
      usedLeaseAnalyses: planUsage.usedLeaseAnalyses,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    }
  },
})
