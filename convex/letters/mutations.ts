import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Plan } from "../schema";
import { assertCanCreateLetter, incrementUsedLetters } from "../planUsage/helpers";

export const saveLetterToDB = internalMutation({
  args: {
    userId: v.string(),
    createdUnderPlan: Plan,
    inputData: v.object({
      letterType: v.string(),
      state: v.string(),
      fullName: v.string(),
      landlordName: v.string(),
      propertyAddress: v.string(),
      senderAddress: v.optional(v.string()),
      landlordAddress: v.optional(v.string()),
      description: v.string(),
      amountAtStake: v.optional(v.string()),
      deadlineDays: v.string(),
    }),
    letterData: v.any(), // Strictly validated by Zod in the action
    fullLetterText: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await assertCanCreateLetter(ctx, args.userId);
    const letterId = await ctx.db.insert("letters", args);
    await incrementUsedLetters(ctx, args.userId);
    return letterId;
  },
});

export const updateFullLetterTextForCurrentUser = mutation({
  args: {
    letterId: v.id("letters"),
    fullLetterText: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const row = await ctx.db.get(args.letterId);
    if (!row || row.userId !== identity.subject) {
      throw new Error("Letter not found");
    }
    await ctx.db.patch(args.letterId, {
      fullLetterText: args.fullLetterText,
    });
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