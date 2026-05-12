import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createConversation = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("chatConversations", {
      userId: identity.subject,
      title: args.title ?? "New chat",
      updatedAt: now,
      createdAt: now,
    });
  },
});


/**
 * Save a chat message within a conversation owned by the user.
 */
export const saveMessage = mutation({
  args: {
    conversationId: v.id("chatConversations"),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv || conv.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const id = await ctx.db.insert("chatMessages", {
      userId: identity.subject,
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
    });

    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });

    const trimmed = args.content.trim();
    if (
      args.role === "user" &&
      trimmed &&
      (conv.title === "New chat" || conv.title === "Earlier messages")
    ) {
      const preview =
        trimmed.length > 48 ? `${trimmed.slice(0, 47)}…` : trimmed;
      await ctx.db.patch(args.conversationId, { title: preview });
    }

    return id;
  },
});

/**
 * Deletes all conversations and messages for the current user.
 */
export const clearHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect();

    await Promise.all(messages.map((msg) => ctx.db.delete(msg._id)));

    const convs = await ctx.db
      .query("chatConversations")
      .withIndex("by_user_updated", (q) =>
        q.eq("userId", identity.subject),
      )
      .collect();

    await Promise.all(convs.map((c) => ctx.db.delete(c._id)));

    return { deletedMessages: messages.length, deletedConversations: convs.length };
  },
});
