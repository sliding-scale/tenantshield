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
      
      // The raw data from the frontend form
      inputData: v.object({
        letterType: v.string(),
        state: v.string(),
        fullName: v.string(),
        landlordName: v.string(),
        propertyAddress: v.string(),
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
    aiAnalysis: v.optional(v.object({
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
    })),
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
})
