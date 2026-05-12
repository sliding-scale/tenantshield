import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Conversations for the sidebar, newest activity first.
 */
export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db
      .query("chatConversations")
      .withIndex("by_user_updated", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

/**
 * Single conversation if owned by the caller (for API validation).
 */
export const getConversation = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) return null;
    return conv;
  },
});

/**
 * Messages for one conversation, chronological.
 */
export const getConversationMessages = query({
  args: { conversationId: v.id("chatConversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();
  },
});

// ========== Chunk Resolvers (used by retrievers) ==========

export const getCaseChunks = internalQuery({
  args: { ids: v.array(v.id("caseEmbeddings")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return docs.filter(Boolean).map((doc) => doc!.chunkText);
  },
});

export const getLeaseChunks = internalQuery({
  args: { ids: v.array(v.id("leaseEmbeddings")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return docs.filter(Boolean).map((doc) => doc!.chunkText);
  },
});

export const getLetterChunks = internalQuery({
  args: { ids: v.array(v.id("letterEmbeddings")) },
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    return docs.filter(Boolean).map((doc) => doc!.chunkText);
  },
});
