import type { MutationCtx } from "../_generated/server"
import type { PaidPlanId } from "./types"

/** First paid subscription: only backfill active case count; letters/leases count from creation only. */
export async function syncFirstPaidPlanEntitlements(
  ctx: MutationCtx,
  clerkId: string,
  plan: PaidPlanId,
) {
  const cases = await ctx.db
    .query("cases")
    .withIndex("by_user_id", (q) => q.eq("userId", clerkId))
    .collect()

  await Promise.all(cases.map((row) => ctx.db.patch(row._id, { createdUnderPlan: plan })))

  return {
    usedActiveCases: cases.filter((row) => (row.caseStatus ?? "active") === "active").length,
    usedLeaseAnalyses: 0,
    usedLetters: 0,
  }
}
