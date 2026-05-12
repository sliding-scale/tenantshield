import { v } from "convex/values"
import { mutation } from "../_generated/server"
import { ISSUE_TYPES } from "../../lib/constants/issue-types"

const ALLOWED_ISSUE_TYPES = new Set<string>(ISSUE_TYPES.map((t) => t.value))

export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    issueTypes: v.array(v.string()),
    scores: v.object({
      responsiveness: v.number(),
      honesty: v.number(),
      depositFairness: v.number(),
      repairSpeed: v.number(),
      overall: v.number(),
    }),
    landlordName: v.string(),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const property = await ctx.db.get(args.propertyId)
    if (!property) throw new Error("Property not found")

    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_property_and_clerk", (q) =>
        q.eq("propertyId", args.propertyId).eq("clerkId", identity.subject),
      )
      .unique()
    if (existing) {
      throw new Error("You have already rated this property.")
    }

    for (const value of Object.values(args.scores)) {
      if (value < 1 || value > 5 || !Number.isFinite(value)) {
        throw new Error("Each score must be between 1 and 5")
      }
    }

    const landlordName = args.landlordName.trim()
    if (landlordName.length === 0) {
      throw new Error("Landlord or property manager name is required.")
    }
    if (landlordName.length > 120) {
      throw new Error("Landlord name must be 120 characters or less.")
    }

    const uniqueIssueTypes = Array.from(new Set(args.issueTypes.map((t) => t.trim()).filter(Boolean)))
    if (uniqueIssueTypes.length === 0) {
      throw new Error("Select at least one issue type.")
    }
    for (const t of uniqueIssueTypes) {
      if (!ALLOWED_ISSUE_TYPES.has(t)) {
        throw new Error("Invalid issue type.")
      }
    }

    const experience = args.experience?.trim() || undefined

    const ratingId = await ctx.db.insert("ratings", {
      propertyId: args.propertyId,
      clerkId: identity.subject,
      scores: args.scores,
      landlordName,
      experience,
      createdAt: Date.now(),
    })

    for (const issueType of uniqueIssueTypes) {
      await ctx.db.insert("ratingsIssueType", {
        issueType,
        clerkId: identity.subject,
        propertyId: args.propertyId,
        ratingId,
      })
    }

    return ratingId
  },
})
