import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";

// ========== Chat History ==========

/**
 * Load the full chat history for the signed-in user, ordered chronologically.
 */
export const getChatHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .order("asc")
      .collect();
  },
});

// ========== Chunk Resolvers (used by retrievers) ==========

// Resolves the _id from vector search into actual text chunks for Cases
export const getCaseChunks = internalQuery({
  args: { ids: v.array(v.id("caseEmbeddings")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map(id => ctx.db.get(id)));
    // Filter out any nulls and return just the text
    return docs.filter(Boolean).map(doc => doc!.chunkText);
  }
});

// Resolves leaseEmbeddings chunk IDs to text (chunk-based search)
export const getLeaseChunks = internalQuery({
  args: { ids: v.array(v.id("leaseEmbeddings")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map(id => ctx.db.get(id)));
    return docs.filter(Boolean).map(doc => doc!.chunkText);
  }
});

// Resolves letterEmbeddings chunk IDs to text (chunk-based search)
export const getLetterChunks = internalQuery({
  args: { ids: v.array(v.id("letterEmbeddings")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map(id => ctx.db.get(id)));
    return docs.filter(Boolean).map(doc => doc!.chunkText);
  }
});