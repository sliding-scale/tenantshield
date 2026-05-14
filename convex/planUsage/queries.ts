import { query } from "../_generated/server"

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const planUsage = await ctx.db
      .query("planUsage")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!planUsage) return null

    return {
      plan: planUsage.plan,
      planType: planUsage.planType,
      usedActiveCases: planUsage.usedActiveCases,
      usedLetters: planUsage.usedLetters,
      usedLeaseAnalyses: planUsage.usedLeaseAnalyses,
    }
  },
})
