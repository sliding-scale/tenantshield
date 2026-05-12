import { v } from "convex/values"
import { mutation } from "../_generated/server"

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    return await ctx.storage.generateUploadUrl()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const name = args.name.trim()
    if (name.length < 2) throw new Error("Property name is too short")
    if (name.length > 120) throw new Error("Property name is too long")

    return await ctx.db.insert("properties", {
      name,
      imageStorageId: args.imageStorageId,
      createdByClerkId: identity.subject,
      createdAt: Date.now(),
    })
  },
})
