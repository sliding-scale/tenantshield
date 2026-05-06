import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const saveLetterToDB = internalMutation({
  args: {
    userId: v.string(),
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
    letterData: v.any(), // Strictly validated by Zod in the action
    fullLetterText: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("letters", args);
  },
});

export const saveLetterEmbeddingsToDB = internalMutation({
  args: {
    letterId: v.id("letters"),
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
      await ctx.db.insert("letterEmbeddings", {
        letterId: args.letterId,
        userId: args.userId,
        chunkType: chunk.chunkType,
        chunkText: chunk.chunkText,
        embedding: chunk.embedding,
      });
    }
  },
});