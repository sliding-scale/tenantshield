import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const Role = v.union(v.literal("admin"), v.literal("tenant"));
export const OnboardingOptionKey = v.union(
  v.literal("option1"),
  v.literal("option2"),
  v.literal("option3"),
  v.literal("option4"),
);

export const Plan = v.union(
  v.literal("free"),
  v.literal("pro"),
  v.literal("power"),
);
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: Role,
    plan: v.optional(Plan),
    onboardingSkippedAt: v.optional(v.number()),
    acceptedTerms: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
<<<<<<< HEAD
    .index("by_email", ["email"]),

  planUsage: defineTable({
    clerkId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    plan: Plan,
    planType: v.union(v.literal("monthly"), v.literal("yearly")),
    subscriptionStatus: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    // usage counters
    usedActiveCases: v.number(),
    usedLeaseAnalyses: v.number(),
    usedLetters: v.number(),
  })
=======
    .index("by_email", ["email"])
    .searchIndex("search_by_name", { searchField: "name" }),
  
    planUsage: defineTable({
      clerkId: v.string(),
      stripeCustomerId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
      plan: Plan,
      planType: v.union(
        v.literal("monthly"),
        v.literal("yearly")
      ),
      subscriptionStatus: v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("past_due"),
        v.literal("trialing")
      ),
      currentPeriodStart: v.number(),
      currentPeriodEnd: v.number(),
      // usage counters
      usedActiveCases: v.number(),
      usedLeaseAnalyses: v.number(),
      usedLetters: v.number(),
    
    })
    
>>>>>>> d2985738b3b2fbfa4d833d0e94aa956d8faf1f24
    .index("by_clerk_id", ["clerkId"])

    .index("by_subscription_id", ["stripeSubscriptionId"]),

  onboardingQuestions: defineTable({
    step: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
    option1: v.string(),
    option2: v.string(),
    option3: v.string(),
    option4: v.string(),
  }).index("by_step", ["step"]),

  onboardingResponses: defineTable({
    clerkId: v.string(),
    questionId: v.id("onboardingQuestions"),
    selectedOption: OnboardingOptionKey,
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_question_id", ["questionId"])
    .index("by_clerk_and_question", ["clerkId", "questionId"]),

  impactScores: defineTable({
    userId: v.id("users"),
    impactScore: v.number(),
    impactLabel: v.union(
      v.literal("Low impact"),
      v.literal("Moderate impact"),
      v.literal("Significant impact"),
      v.literal("Critical situation"),
    ),
  }).index("by_user_id", ["userId"]),

  // i am adding schema for the new case table feature
  cases: defineTable({
    userId: v.string(), // ye clerk id se match ke liye
    // New inserts always set "active"; optional only for legacy rows before this field existed.
    caseStatus: v.optional(v.union(v.literal("active"), v.literal("archived"))),
    //ye frontend se ayega is mein save hoga
    createdUnderPlan: v.optional(Plan),
    inputData: v.object({
      issueType: v.string(),
      shortTitle: v.string(),
      description: v.string(),
      state: v.string(),
      city: v.optional(v.string()),
      landlordName: v.optional(v.string()),
      propertyAddress: v.optional(v.string()),
    }),

    // ye mein return karon ga pipeline se case feature ke
    aiAnalysis: v.object({
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
    .index("by_user_id", ["userId"])
    // CRITICAL: The Vector Index
    .vectorIndex("by_user_embedding", {
      vectorField: "embedding",
      dimensions: 768, // Google's text-embedding-004 model uses 768 dimensions.
      filterFields: ["userId"], // Guarantees a user can only search their own cases
    }),

  caseEmbeddings: defineTable({
    caseId: v.id("cases"),
    userId: v.string(),
    chunkType: v.string(),
    chunkText: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_case_id", ["caseId"])
    .vectorIndex("by_user_case_chunk_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId", "caseId"],
    }),

  //ye letters ka schema hai
  letters: defineTable({
    userId: v.string(),
    createdUnderPlan: v.optional(Plan),

    // The raw data from the frontend form
    inputData: v.object({
      letterType: v.string(),
      state: v.string(),
      fullName: v.string(),
      landlordName: v.string(),
      propertyAddress: v.string(),
      /** Tenant mailing address; copied verbatim into letter header (not AI-generated). */
      senderAddress: v.optional(v.string()),
      /** Landlord mailing address; copied verbatim into letter header (not AI-generated). */
      landlordAddress: v.optional(v.string()),
      description: v.string(),
      amountAtStake: v.optional(v.string()),
      deadlineDays: v.string(),
    }),

    // The structured AI output (matching our aiSchema)
    letterData: v.object({
      metadata: v.any(),
      header: v.any(),
      salutation: v.string(),
      paragraphs: v.array(v.any()),
      signOff: v.string(),
    }),

    // A concatenated version of the letter for easier embedding search
    fullLetterText: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_user_id", ["userId"])
    .vectorIndex("by_user_letter_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId"],
    }),

  letterEmbeddings: defineTable({
    letterId: v.id("letters"),
    userId: v.string(),
    chunkType: v.string(),
    chunkText: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_letter_id", ["letterId"])
    .vectorIndex("by_user_letter_chunk_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId", "letterId"],
    }),

  leases: defineTable({
    userId: v.string(),
    state: v.string(),
    leaseText: v.string(),
    pdfFile: v.optional(v.id("_storage")),
    createdUnderPlan: v.optional(Plan),
    aiAnalysis: v.optional(
      v.object({
        leaseReview: v.string(),
        documentSummary: v.string(),
        redFlags: v.array(
          v.object({
            quote: v.string(),
            problem: v.string(),
          }),
        ),
        missingClauses: v.array(
          v.object({
            clauseName: v.string(),
            explanation: v.string(),
          }),
        ),
        tenantFriendlyClauses: v.array(
          v.object({
            quote: v.string(),
            explanation: v.string(),
          }),
        ),
        questionsToAsk: v.array(v.string()),
        overallRecommendation: v.string(),
      }),
    ),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_user_id", ["userId"])
    .vectorIndex("by_user_lease_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId"],
    }),

  leaseEmbeddings: defineTable({
    leaseId: v.id("leases"),
    userId: v.string(),
    chunkType: v.string(),
    chunkText: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_lease_id", ["leaseId"])
    .vectorIndex("by_user_lease_chunk_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId", "leaseId"],
    }),
  stateTenantLaws: defineTable({
    stateCode: v.string(),
    stateName: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    lawDetails: v.object({
      headlineMetrics: v.object({
        depositCap: v.string(),
        gracePeriod: v.string(),
        noticeToQuit: v.string(),
      }),
      depositReturnTimeline: v.string(),
      repairAndHabitability: v.object({
        landlordObligation: v.string(),
        legalCitation: v.optional(v.string()),
        repairAndDeductAvailable: v.optional(v.boolean()),
      }),
      evictionNotice: v.object({
        nonpayment: v.string(),
        otherBreach: v.string(),
      }),
    }),
  }).index("by_state_code", ["stateCode"]),
  // ========== Ask AI (threaded chat) ==========
  chatConversations: defineTable({
    userId: v.string(),
    title: v.string(),
    updatedAt: v.number(),
    createdAt: v.number(),
    createdUnderPlan: v.optional(Plan),
  }).index("by_user_updated", ["userId", "updatedAt"]),

  chatMessages: defineTable({
    userId: v.string(),
    conversationId: v.optional(v.id("chatConversations")),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    toolCalls: v.optional(
      v.array(
        v.object({
          toolName: v.string(),
          args: v.any(),
          result: v.optional(v.string()),
        }),
      ),
    ),
  })
    .index("by_user_id", ["userId"])
    .index("by_conversation", ["conversationId"]),
  properties: defineTable({
    name: v.string(),
    imageStorageId: v.id("_storage"),
    createdByClerkId: v.string(),
    createdAt: v.number(),
    /** When false, property is hidden/disabled (admin). Omitted = enabled for legacy rows. */
    enabled: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["createdByClerkId"])
    .searchIndex("search_by_name", { searchField: "name" }),

  ratings: defineTable({
    propertyId: v.id("properties"),
    clerkId: v.string(),
    scores: v.object({
      responsiveness: v.number(),
      honesty: v.number(),
      depositFairness: v.number(),
      repairSpeed: v.number(),
      overall: v.number(),
    }),
    landlordName: v.optional(v.string()),
    experience: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_property_id", ["propertyId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_property_and_clerk", ["propertyId", "clerkId"]),

  ratingsIssueType: defineTable({
    issueType: v.string(),
    clerkId: v.string(),
    propertyId: v.id("properties"),
    ratingId: v.id("ratings"),
  })
    .index("by_issue_type", ["issueType"])
    .index("by_rating_id", ["ratingId"])
    .index("by_property_id", ["propertyId"]),
});
