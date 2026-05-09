import { internalQuery, query } from "../_generated/server"
import { v } from "convex/values"

export const getLeaseForCurrentUser = query({
  args: { leaseId: v.id("leases") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const lease = await ctx.db.get(args.leaseId)
    if (!lease || lease.userId !== identity.subject) return null
    return lease
  },
})

export const getLeaseById = internalQuery({
  args: { leaseId: v.id("leases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.leaseId)
  },
})
