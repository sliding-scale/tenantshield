import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const Role = v.union(v.literal("admin"), v.literal("tenant"))

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: Role,
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),


  // i am adding schema for the new case table feature
  cases: defineTable({
    userId: v.string(), // ye clerk id se match ke liye

    //ye frontend se ayega is mein save hoga
    inputData:v.object({
      issueType: v.string(),
      shortTitle: v.string(),
      description: v.string(),
      state: v.string(),
      city: v.optional(v.string()),
      landlordName: v.optional(v.string()),
      propertyAddress: v.optional(v.string()),
    }),


    // ye mein return karon ga pipeline se case feature ke
    aiAnalysis:v.object({
      caseStrength: v.number(),
      summary: v.string(),
      yourRights: v.array(v.string()),
      recommendedActions: v.array(v.string()),
      documentation: v.array(v.string()),
      redFlags: v.array(v.string()),
      userTimeline: v.array(v.string()),
      caseStrengthDescription: v.string(),
    }),

    //ye semantic search ke liye hoga
    embedding: v.array(v.float64()),

  })
  // CRITICAL: The Vector Index
  .vectorIndex("by_user_embedding", {
    vectorField: "embedding",
    dimensions: 768, // Google's text-embedding-004 model uses 768 dimensions.
    filterFields: ["userId"], // Guarantees a user can only search their own cases
  }),

})
