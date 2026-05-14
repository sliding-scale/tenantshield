import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { query } from "../_generated/server"
import { requireAdmin } from "./helpers"
import { attachImageUrl, attachRatingSummary } from "../properties/helper"

export const listUsersPaginated = query({
  args: {
    searchName: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const term = args.searchName.trim()
    const ordered =
      term.length === 0
        ? ctx.db.query("users").order("desc")
        : ctx.db
            .query("users")
            .withSearchIndex("search_by_name", (q) => q.search("name", term))

    const paginated = await ordered.paginate(args.paginationOpts)

    const page = await Promise.all(
      paginated.page.map(async (u) => {
        const clerkId = u.clerkId

        const planUsage = await ctx.db
          .query("planUsage")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .first()

        const currentPlan = planUsage?.plan ?? u.plan ?? "free"

        const cases = await ctx.db
          .query("cases")
          .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
          .collect()
        const activeCases = cases.filter((c) => c.caseStatus !== "archived").length

        const letters = await ctx.db
          .query("letters")
          .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
          .collect()

        const conversations = await ctx.db
          .query("chatConversations")
          .withIndex("by_user_updated", (q) => q.eq("userId", clerkId))
          .collect()

        const leases = await ctx.db
          .query("leases")
          .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
          .collect()

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          currentPlan,
          activeCases,
          generatedLetters: letters.length,
          chatCount: conversations.length,
          leasesAnalyzed: leases.length,
        }
      }),
    )

    return {
      page,
      isDone: paginated.isDone,
      continueCursor: paginated.continueCursor,
    }
  },
})

export const listPropertiesPaginated = query({
  args: {
    searchName: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const term = args.searchName.trim()
    const ordered =
      term.length === 0
        ? ctx.db.query("properties").order("desc")
        : ctx.db
            .query("properties")
            .withSearchIndex("search_by_name", (q) => q.search("name", term))

    const paginated = await ordered.paginate(args.paginationOpts)

    const withUrls = await Promise.all(paginated.page.map((row) => attachImageUrl(ctx, row)))
    const enrichedPage = await Promise.all(withUrls.map((row) => attachRatingSummary(ctx, row)))

    const page = enrichedPage.map((row) => ({
      _id: row._id,
      name: row.name,
      imageUrl: row.imageUrl,
      ratingCount: row.reviewCount,
      avgRating: row.overallRating,
      enabled: row.enabled !== false,
    }))

    return {
      page,
      isDone: paginated.isDone,
      continueCursor: paginated.continueCursor,
    }
  },
})
