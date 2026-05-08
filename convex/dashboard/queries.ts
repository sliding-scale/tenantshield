import { query } from "../_generated/server"

export const countsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { activeCases: 0, letters: 0 }
    }

    const userId = identity.subject

    const cases = await ctx.db
      .query("cases")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect()

    const activeRows = cases.filter((c) => (c.caseStatus ?? "active") === "active")
    const activeCases = activeRows.length
    const protectionIndex =
      activeCases === 0
        ? 0
        : activeRows.reduce((sum, row) => sum + row.aiAnalysis.caseStrength, 0) / activeCases

    const letters = await ctx.db
      .query("letters")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect()

    return {
      activeCases,
      letters: letters.length,
      protectionIndex,
    }
  },
})
