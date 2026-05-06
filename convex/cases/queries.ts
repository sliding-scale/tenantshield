import { v } from "convex/values"
import { query } from "../_generated/server"

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const rows = await ctx.db
      .query("cases")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect()

    return rows.sort((a, b) => b._creationTime - a._creationTime)
  },
})

export const getByIdForCurrentUser = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const row = await ctx.db.get(args.caseId)
    if (!row) return null
    if (row.userId !== identity.subject) return null

    return row
  },
})
