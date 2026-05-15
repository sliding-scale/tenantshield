import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Plan } from "../schema";
import {
  assertCanCreateLetter,
  decrementUsedLetters,
  incrementUsedLetters,
} from "../planUsage/helpers";

const CASE_ALREADY_HAS_LETTER =
  "This case already has a letter attached. Open the existing letter from the case page.";

export const saveLetterToDB = internalMutation({
  args: {
    userId: v.string(),
    createdUnderPlan: Plan,
    caseId: v.optional(v.id("cases")),
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
    if (args.caseId) {
      const caseRow = await ctx.db.get(args.caseId);
      if (!caseRow || caseRow.userId !== args.userId) {
        throw new Error("Case not found");
      }
      const existing = await ctx.db
        .query("letters")
        .withIndex("by_case_id", (q) => q.eq("caseId", args.caseId))
        .first();
      if (existing) {
        throw new Error(CASE_ALREADY_HAS_LETTER);
      }
    }

    await assertCanCreateLetter(ctx, args.userId);
    const { caseId, userId, createdUnderPlan, inputData, letterData, fullLetterText, embedding } =
      args;
    const letterId = await ctx.db.insert("letters", {
      userId,
      createdUnderPlan,
      caseId,
      inputData,
      letterData,
      fullLetterText,
      embedding,
    });
    await incrementUsedLetters(ctx, args.userId);
    return letterId;
  },
});

export const deleteLetterForCurrentUser = mutation({
  args: { letterId: v.id("letters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const row = await ctx.db.get(args.letterId);
    if (!row || row.userId !== identity.subject) {
      throw new Error("Letter not found");
    }

    const chunks = await ctx.db
      .query("letterEmbeddings")
      .withIndex("by_letter_id", (q) => q.eq("letterId", args.letterId))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    await ctx.db.delete(args.letterId);
    await decrementUsedLetters(ctx, identity.subject);

    return { success: true };
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