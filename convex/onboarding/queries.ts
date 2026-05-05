import { query } from "../_generated/server"

export const onboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return null

    const activeQuestions = await ctx.db
      .query("onboardingQuestions")
      .withIndex("by_step")
      .collect()

    const activeOnly = activeQuestions.filter((q) => q.isActive)
    const responses = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect()

    const answeredQuestionIds = new Set(responses.map((r) => r.questionId))
    const answeredActiveCount = activeOnly.filter((q) => answeredQuestionIds.has(q._id)).length
    const totalActiveCount = activeOnly.length
    const isComplete = totalActiveCount > 0 && answeredActiveCount >= totalActiveCount
    const shouldShowOnboarding =
      !user.onboardingSkippedAt && totalActiveCount > 0 && answeredActiveCount < totalActiveCount

    return {
      userId: user._id,
      skipped: Boolean(user.onboardingSkippedAt),
      answeredActiveCount,
      totalActiveCount,
      isComplete,
      shouldShowOnboarding,
    }
  },
})

export const questionsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) return null

    const allQuestions = await ctx.db
      .query("onboardingQuestions")
      .withIndex("by_step")
      .collect()
    const activeQuestions = allQuestions.filter((q) => q.isActive)

    const responses = await ctx.db
      .query("onboardingResponses")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect()

    const selectedByQuestionId = new Map(
      responses.map((response) => [response.questionId, response.selectedOption]),
    )

    return activeQuestions.map((question) => ({
      ...question,
      selectedOption: selectedByQuestionId.get(question._id) ?? null,
    }))
  },
})
