import { v } from "convex/values"
import { mutation } from "../_generated/server"
import { OnboardingOptionKey } from "../schema"

export const saveResponse = mutation({
  args: {
    questionId: v.id("onboardingQuestions"),
    selectedOption: OnboardingOptionKey,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!user) throw new Error("User not found")

    const question = await ctx.db.get(args.questionId)
    if (!question || !question.isActive) {
      throw new Error("Question not found")
    }

    const existing = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_user_and_question", (q) =>
        q.eq("userId", user._id).eq("questionId", args.questionId),
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        selectedOption: args.selectedOption,
      })
    } else {
      await ctx.db.insert("onboardingResponses", {
        userId: user._id,
        questionId: args.questionId,
        selectedOption: args.selectedOption,
      })
    }

    return { ok: true }
  },
})

export const skip = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      onboardingSkippedAt: Date.now(),
    })

    return { ok: true }
  },
})
