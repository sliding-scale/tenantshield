import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Save a single chat message (user or assistant) to the persistent history.
 */
export const saveMessage = mutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.object({
      toolName: v.string(),
      args: v.any(),
      result: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("chatMessages", {
      userId: identity.subject,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
    });
  },
});

/**
 * Clear all chat history for the current user (for "New Chat" functionality).
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
    return { deleted: messages.length };
  },
});
