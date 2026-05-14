import type { MutationCtx, QueryCtx } from "../_generated/server"

type AuthCtx = QueryCtx | MutationCtx

/** Throws if not signed in or Convex user is not an admin. */
export async function requireAdmin(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Unauthorized")
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique()
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden")
  }
}
