import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const saveCaseToDB = internalMutation({
  args: {
    userId: v.string(),
    inputData: v.object({
      issueType: v.string(),
      shortTitle: v.string(),
      description: v.string(),
      state: v.string(),
      city: v.optional(v.string()),
      landlordName: v.optional(v.string()),
      propertyAddress: v.optional(v.string()),
    }),
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
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const newCaseId = await ctx.db.insert("cases", args);
    return newCaseId;
  },
});

export const saveCaseEmbeddingsToDB = internalMutation({
  args: {
    caseId: v.id("cases"),
    userId: v.string(),
    chunks: v.array(
      v.object({
        chunkType: v.string(),
        chunkText: v.string(),
        embedding: v.array(v.float64()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const chunk of args.chunks) {
      await ctx.db.insert("caseEmbeddings", {
        caseId: args.caseId,
        userId: args.userId,
        chunkType: chunk.chunkType,
        chunkText: chunk.chunkText,
        embedding: chunk.embedding,
      });
    }
  },
});
