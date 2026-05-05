import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const Role = v.union(v.literal("admin"), v.literal("tenant"))
export const OnboardingOptionKey = v.union(
  v.literal("option1"),
  v.literal("option2"),
  v.literal("option3"),
  v.literal("option4")
)

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: Role,
    onboardingSkippedAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  onboardingQuestions: defineTable({
    step: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
    option1: v.string(),
    option2: v.string(),
    option3: v.string(),
    option4: v.string(),
    isActive: v.boolean(),
  }).index("by_step", ["step"]),

  onboardingResponses: defineTable({
    userId: v.id("users"),
    questionId: v.id("onboardingQuestions"),
    selectedOption: OnboardingOptionKey,
  })
    .index("by_user_id", ["userId"])
    .index("by_question_id", ["questionId"])
    .index("by_user_and_question", ["userId", "questionId"]),

})
