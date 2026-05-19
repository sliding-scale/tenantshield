import { internalMutation } from "../_generated/server"

/** One-time seed — `npx convex run planCatalog/seed:seedPlanCatalog` (or Dashboard). */
export const seedPlanCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("planCatalog").first()
    if (existing) {
      return { inserted: 0, message: "planCatalog already has rows; skipped." }
    }

    const rows = [
      {
        tier: "free" as const,
        name: "Basic Shield",
        features: [
          "Limited AI tenant guidance",
          "Start a case only",
          "Upload leases only",
          "Preview letters only",
        ],
        cta: "Get Started",
        sortOrder: 0,
        isActive: true,
      },
      {
        tier: "pro" as const,
        name: "Pro Shield",
        features: [
          "Unlimited AI tenant guidance",
          "2 active cases",
          "2 lease analyses per month",
          "2 letters per month",
          "Letter export and priority responses",
        ],
        cta: "Choose Pro",
        popular: true,
        monthlyPriceId: "price_REPLACE_PRO_MONTHLY",
        yearlyPriceId: "price_REPLACE_PRO_YEARLY",
        sortOrder: 1,
        isActive: true,
      },
      {
        tier: "power" as const,
        name: "Ultimate Shield",
        features: [
          "Unlimited AI tenant guidance",
          "10 active cases",
          "10 lease analyses per month",
          "10 letters per month",
          "Letter export and priority responses",
        ],
        cta: "Choose Ultimate",
        monthlyPriceId: "price_REPLACE_POWER_MONTHLY",
        yearlyPriceId: "price_REPLACE_POWER_YEARLY",
        sortOrder: 2,
        isActive: true,
      },
    ]

    for (const row of rows) {
      await ctx.db.insert("planCatalog", row)
    }

    return { inserted: rows.length, message: "Seeded planCatalog (replace Stripe price IDs in Dashboard before production)." }
  },
})
