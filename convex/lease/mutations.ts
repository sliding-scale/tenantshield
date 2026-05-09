import type { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const saveLeaseToDB = internalMutation({
  args: {
    userId: v.string(),
    state: v.string(),
    leaseText: v.string(),
    aiAnalysis: v.object({
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
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leases", args);
  },
});

export const saveLeaseEmbeddingsToDB = internalMutation({
  args: {
    leaseId: v.id("leases"),
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
      await ctx.db.insert("leaseEmbeddings", {
        leaseId: args.leaseId,
        userId: args.userId,
        chunkType: chunk.chunkType,
        chunkText: chunk.chunkText,
        embedding: chunk.embedding,
      });
    }
    return args.leaseId as Id<"leases">;
  },
});