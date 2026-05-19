import { internalQuery, query } from "../_generated/server"
import { v } from "convex/values"

const PaidPlan = v.union(v.literal("pro"), v.literal("power"))

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("planCatalog").collect()
    const active = rows.filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
    return active.map((r) => ({
      _id: r._id,
      tier: r.tier,
      name: r.name,
      features: r.features,
      cta: r.cta,
      popular: r.popular,
    }))
  },
})

export const getStripePriceIdForPlan = internalQuery({
  args: {
    tier: PaidPlan,
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("planCatalog")
      .withIndex("by_tier_active", (q) => q.eq("tier", args.tier).eq("isActive", true))
      .unique()
    if (!row) return null
    const priceId = args.billingPeriod === "monthly" ? row.monthlyPriceId : row.yearlyPriceId
    return priceId ?? null
  },
})

function isPaidTier(tier: "free" | "pro" | "power"): tier is "pro" | "power" {
  return tier === "pro" || tier === "power"
}

export const resolvePlanFromStripePriceId = internalQuery({
  args: { stripePriceId: v.string() },
  handler: async (ctx, args) => {
    const monthly = await ctx.db
      .query("planCatalog")
      .withIndex("by_monthly_price_id", (q) => q.eq("monthlyPriceId", args.stripePriceId))
      .first()
    if (monthly?.isActive && isPaidTier(monthly.tier)) {
      return { tier: monthly.tier, billingPeriod: "monthly" as const }
    }
    const yearly = await ctx.db
      .query("planCatalog")
      .withIndex("by_yearly_price_id", (q) => q.eq("yearlyPriceId", args.stripePriceId))
      .first()
    if (yearly?.isActive && isPaidTier(yearly.tier)) {
      return { tier: yearly.tier, billingPeriod: "yearly" as const }
    }
    return null
  },
})
