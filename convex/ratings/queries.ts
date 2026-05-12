import { v } from "convex/values"
import { query, type QueryCtx } from "../_generated/server"
import type { Doc, Id } from "../_generated/dataModel"

async function issueTypesForRating(
  ctx: QueryCtx,
  ratingId: Id<"ratings">
): Promise<string[]> {
  const rows = await ctx.db
    .query("ratingsIssueType")
    .withIndex("by_rating_id", (q) => q.eq("ratingId", ratingId))
    .collect()
  const set = new Set(rows.map((r) => r.issueType))
  return Array.from(set)
}

/** Rating document plus issue types from `ratingsIssueType`. */
export type RatingWithIssueTypes = Doc<"ratings"> & { issueTypes: string[] }

/** Returns the signed-in user's rating for this property, or null if none / not signed in. */
export const currentUserRatingForProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    return await ctx.db
      .query("ratings")
      .withIndex("by_property_and_clerk", (q) =>
        q.eq("propertyId", args.propertyId).eq("clerkId", identity.subject),
      )
      .unique()
  },
})

export const listForProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args): Promise<RatingWithIssueTypes[]> => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_property_id", (q) => q.eq("propertyId", args.propertyId))
      .order("desc")
      .collect()

    return await Promise.all(
      ratings.map(async (r) => ({
        ...r,
        issueTypes: await issueTypesForRating(ctx, r._id),
      })),
    )
  },
})

export const propertySummary = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("ratings")
      .withIndex("by_property_id", (q) => q.eq("propertyId", args.propertyId))
      .collect()

    if (rows.length === 0) {
      return { count: 0, averages: null, issueTypes: [] as string[] }
    }

    const totals = rows.reduce(
      (acc, r) => {
        acc.responsiveness += r.scores.responsiveness
        acc.honesty += r.scores.honesty
        acc.depositFairness += r.scores.depositFairness
        acc.repairSpeed += r.scores.repairSpeed
        acc.overall += r.scores.overall
        return acc
      },
      { responsiveness: 0, honesty: 0, depositFairness: 0, repairSpeed: 0, overall: 0 },
    )

    const junctionRows = await ctx.db
      .query("ratingsIssueType")
      .withIndex("by_property_id", (q) => q.eq("propertyId", args.propertyId))
      .collect()

    const issueSet = new Set(junctionRows.map((r) => r.issueType))

    return {
      count: rows.length,
      averages: {
        responsiveness: totals.responsiveness / rows.length,
        honesty: totals.honesty / rows.length,
        depositFairness: totals.depositFairness / rows.length,
        repairSpeed: totals.repairSpeed / rows.length,
        overall: totals.overall / rows.length,
      },
      issueTypes: Array.from(issueSet),
    }
  },
})
