import { v } from "convex/values"
import { query } from "../_generated/server"

const PAGE_SIZE = 3


/** Paginated list (3 per page) for active or archived cases. */
export const listCasesPaged = query({
  args: {
    status: v.union(v.literal("active"), v.literal("archived")),
    page: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return {
        items: [],
        totalCount: 0,
        page: 0,
        totalPages: 0,
        pageSize: PAGE_SIZE,
      }
    }

    const rows = await ctx.db
      .query("cases")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect()

    const filtered = rows
      .filter((r) => r.caseStatus === args.status)
      .sort((a, b) => b._creationTime - a._creationTime)

    const totalCount = filtered.length
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / PAGE_SIZE)
    const safePage = Math.max(0, Math.floor(args.page))
    const cappedPage =
      totalPages === 0 ? 0 : Math.min(safePage, totalPages - 1)
    const start = cappedPage * PAGE_SIZE
    const items = filtered.slice(start, start + PAGE_SIZE)

    return {
      items,
      totalCount,
      page: cappedPage,
      totalPages,
      pageSize: PAGE_SIZE,
    }
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
