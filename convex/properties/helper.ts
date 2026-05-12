import { type QueryCtx } from "../_generated/server"
import type { Doc } from "../_generated/dataModel"

export async function attachImageUrl(
  ctx: { storage: { getUrl: (id: Doc<"properties">["imageStorageId"]) => Promise<string | null> } },
  property: Doc<"properties">,
) {
  const imageUrl = await ctx.storage.getUrl(property.imageStorageId)
  return { ...property, imageUrl }
}

export async function attachRatingSummary(
  ctx: QueryCtx,
  property: Doc<"properties"> & { imageUrl: string | null },
) {
  const ratings = await ctx.db
    .query("ratings")
    .withIndex("by_property_id", (q) => q.eq("propertyId", property._id))
    .collect()

  const reviewCount = ratings.length
  let overallRating: number | null = null
  if (reviewCount > 0) {
    const sum = ratings.reduce((acc, r) => acc + r.scores.overall, 0)
    overallRating = sum / reviewCount
  }

  const junctionRows = await ctx.db
    .query("ratingsIssueType")
    .withIndex("by_property_id", (q) => q.eq("propertyId", property._id))
    .collect()

  const tags = Array.from(new Set(junctionRows.map((r) => r.issueType)))

  return {
    ...property,
    reviewCount,
    overallRating,
    tags,
  }
}
