import { v } from "convex/values"
import { query } from "../_generated/server"

const PAGE_SIZE = 3

export const listLettersPaged = query({
  args: { page: v.number() },
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
      .query("letters")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect()
    const sorted = rows.sort((a, b) => b._creationTime - a._creationTime)

    const totalCount = sorted.length
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / PAGE_SIZE)
    const safePage = Math.max(0, Math.floor(args.page))
    const cappedPage = totalPages === 0 ? 0 : Math.min(safePage, totalPages - 1)
    const end = Math.min(sorted.length, (cappedPage + 1) * PAGE_SIZE)
    const pageRows = sorted.slice(0, end)

    const items = pageRows.map((row) => ({
      _id: row._id,
      _creationTime: row._creationTime,
      inputData: {
        letterType: row.inputData.letterType,
        state: row.inputData.state,
        landlordName: row.inputData.landlordName,
      },
      letterData: {
        metadata: row.letterData.metadata,
        header: row.letterData.header,
      },
      preview: row.fullLetterText.slice(0, 220),
    }))

    return {
      items,
      totalCount,
      page: cappedPage,
      totalPages,
      pageSize: PAGE_SIZE,
    }
  },
})

/** Full letter for detail view; excludes embedding. */
export const getByIdForCurrentUser = query({
  args: { letterId: v.id("letters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const row = await ctx.db.get(args.letterId)
    if (!row || row.userId !== identity.subject) return null

    return {
      inputData: row.inputData,
      letterData: row.letterData,
      fullLetterText: row.fullLetterText,
      createdUnderPlan: row.createdUnderPlan,
    }
  },
})

