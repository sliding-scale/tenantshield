import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { query } from "../_generated/server"
import { attachImageUrl } from "./helper"
import { attachRatingSummary } from "./helper"

export const searchByName = query({
  args: {
    query: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const trimmed = args.query.trim()
    // console.log("checking search")
    const ordered =
      trimmed.length === 0
        ? ctx.db.query("properties").order("desc")
        : ctx.db
            .query("properties")
            .withSearchIndex("search_by_name", (q) => q.search("name", trimmed))

    const paginated = await ordered.paginate(args.paginationOpts)
    const withUrls = await Promise.all(paginated.page.map((row) => attachImageUrl(ctx, row)))
    const enrichedPage = await Promise.all(withUrls.map((row) => attachRatingSummary(ctx, row)))

    return {
      ...paginated,
      page: enrichedPage,
    }
  },
})

export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id)
    if (!property) return null
    return await attachImageUrl(ctx, property)
  },
})
