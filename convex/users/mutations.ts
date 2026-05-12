import { internalMutation, mutation } from "../_generated/server"
import { v } from "convex/values"
import { Role } from "../schema"

export const createOrUpdateFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: Role,
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()

    const byClerk = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()

    if (byClerk) {
      await ctx.db.patch(byClerk._id, {
        email,
        name: args.name,
        role: byClerk.role === "admin" ? "admin" : "tenant",
      })
      return byClerk._id
    }
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email,
      name: args.name,
      role: "tenant",
    })
  },
})

export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()
    if (!existing) return null
    await ctx.db.delete(existing._id)
    return existing._id
  },
})

export const clearOnboardingSkipByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()
    if (!existing) return null
    await ctx.db.patch(existing._id, { onboardingSkippedAt: undefined })
    return existing._id
  },
})

export const acceptTerms = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthenticated")

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    
    if (!existing) throw new Error("User not found")
    
    await ctx.db.patch(existing._id, { acceptedTerms: true })
    return existing._id
  },
})
