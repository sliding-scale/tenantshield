import { internalQuery } from "../_generated/server"
import { v } from "convex/values"

/** Prior subscription row for webhook fallback when metadata is stripped (update/delete). */
export const getClerkContextByStripeSubscriptionId = internalQuery({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const subRows = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_stripe_subscription_id", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .collect()

    const subscriptionRow =
      subRows.find((r) => r.isActive) ??
      subRows.sort((a, b) => b._creationTime - a._creationTime)[0]

    if (subscriptionRow) {
      return {
        clerkId: subscriptionRow.clerkId,
        stripeCustomerId: subscriptionRow.stripeCustomerId,
        tier: subscriptionRow.tier,
        planType: subscriptionRow.planType,
        stripePriceId: subscriptionRow.stripePriceId ?? null,
        currentPeriodStart: subscriptionRow.currentPeriodStart,
        currentPeriodEnd: subscriptionRow.currentPeriodEnd,
      }
    }

    const planUsage = await ctx.db
      .query("planUsage")
      .withIndex("by_subscription_id", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .first()

    if (!planUsage) return null
    if (planUsage.plan !== "pro" && planUsage.plan !== "power") return null

    return {
      clerkId: planUsage.clerkId,
      stripeCustomerId: planUsage.stripeCustomerId ?? null,
      tier: planUsage.plan,
      planType: planUsage.planType,
      stripePriceId: null,
      currentPeriodStart: planUsage.currentPeriodStart,
      currentPeriodEnd: planUsage.currentPeriodEnd,
    }
  },
})
