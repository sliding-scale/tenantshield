import { internalMutation, internalQuery } from "../_generated/server"
import { v } from "convex/values"

export const isEventProcessed = internalQuery({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("stripeWebhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .first()
    return row !== null
  },
})

export const markEventProcessed = internalMutation({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stripeWebhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .first()
    if (existing) return
    await ctx.db.insert("stripeWebhookEvents", { eventId: args.eventId })
  },
})
