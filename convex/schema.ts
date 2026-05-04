import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const Role = v.union(v.literal("admin"), v.literal("tenant"))

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: Role,
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
})
