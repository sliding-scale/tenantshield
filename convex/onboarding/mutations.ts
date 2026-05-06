import { v } from "convex/values"
import { mutation } from "../_generated/server"
import { OnboardingOptionKey } from "../schema"
import { computeImpactScore, IMPACT_STEPS } from "../../lib/onboarding/impactScore"

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
    if (!question) {
      throw new Error("Question not found")
    }

    const existing = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_clerk_and_question", (q) =>
        q.eq("clerkId", identity.subject).eq("questionId", args.questionId),
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        selectedOption: args.selectedOption,
      })
    } else {
      await ctx.db.insert("onboardingResponses", {
        clerkId: identity.subject,
        questionId: args.questionId,
        selectedOption: args.selectedOption,
      })
    }

    return { ok: true }
  },
})

export const finalizeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!user) throw new Error("User not found")

    const allQuestions = await ctx.db
      .query("onboardingQuestions")
      .withIndex("by_step")
      .collect()
    const questionsByStep = allQuestions.sort((a, b) => a.step - b.step)

    if (questionsByStep.length !== IMPACT_STEPS.length) {
      throw new Error(
        `Onboarding must have exactly ${IMPACT_STEPS.length} questions (found ${questionsByStep.length})`,
      )
    }
    for (let i = 0; i < IMPACT_STEPS.length; i++) {
      const expected = IMPACT_STEPS[i]
      if (questionsByStep[i].step !== expected) {
        throw new Error(
          `Onboarding step mismatch: index ${i} must be step ${expected}, got ${questionsByStep[i].step}`,
        )
      }
    }

    const responses = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .collect()

    const selectedByQuestionId = new Map(
      responses.map((r) => [r.questionId, r.selectedOption]),
    )

    const scoreInput = questionsByStep.map((q) => {
      const selected = selectedByQuestionId.get(q._id)
      if (!selected) {
        throw new Error("Complete all questions first")
      }
      return { step: q.step, selectedOption: selected }
    })

    const { score, label } = computeImpactScore(scoreInput)

    const existing = await ctx.db
      .query("impactScores")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        impactScore: score,
        impactLabel: label,
      })
    } else {
      await ctx.db.insert("impactScores", {
        userId: user._id,
        impactScore: score,
        impactLabel: label,
      })
    }

    return { impactScore: score, impactLabel: label }
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
