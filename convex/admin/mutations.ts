import { v } from "convex/values"
import { mutation } from "../_generated/server"
import { requireAdmin } from "./helpers"

export const setPropertyEnabled = mutation({
  args: {
    propertyId: v.id("properties"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const row = await ctx.db.get(args.propertyId)
    if (!row) {
      throw new Error("Property not found")
    }
    await ctx.db.patch(args.propertyId, { enabled: args.enabled })
    return args.propertyId
  },
})
