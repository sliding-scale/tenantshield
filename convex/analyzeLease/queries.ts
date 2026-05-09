import { query } from "../_generated/server"
import { v } from "convex/values"

export const getLeasesByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    return await ctx.db
      .query("leases")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect()
  },
})
