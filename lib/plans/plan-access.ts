import {
  PLAN_LIMITS,
  getActiveCaseLimit,
  getLetterLimit,
  type BillingPeriod,
  type PlanId,
} from "./plans"

export type { PlanId, BillingPeriod }

// ── Error sentinels (thrown server-side, matched client-side) ─────────────────
export const ACTIVE_CASE_LIMIT_REACHED = "ACTIVE_CASE_LIMIT_REACHED"
export const FREE_CASE_LIMIT_REACHED = "FREE_CASE_LIMIT_REACHED"
export const LETTER_LIMIT_REACHED = "LETTER_LIMIT_REACHED"
export const LEASE_ANALYSIS_LIMIT_REACHED = "LEASE_ANALYSIS_LIMIT_REACHED"

// ── Plan resolution ───────────────────────────────────────────────────────────
export function resolvePlanId(plan: PlanId | null | undefined): PlanId {
  return plan ?? "free"
}

export function planDisplayLabel(plan: PlanId | null | undefined): string {
  switch (resolvePlanId(plan)) {
    case "free":  return "Free"
    case "pro":   return "Pro"
    case "power": return "Power"
  }
}

// ── Client-side limit checks ──────────────────────────────────────────────────
export function hasReachedActiveCaseLimit(plan: PlanId, period: BillingPeriod, count: number) {
  if (plan === "free") return false
  return count >= getActiveCaseLimit(plan, period)
}

export function hasReachedLetterLimit(plan: PlanId, period: BillingPeriod, count: number) {
  if (plan === "free") return false
  return count >= getLetterLimit(plan, period)
}

export function hasReachedLeaseAnalysisLimit(plan: PlanId, period: BillingPeriod, count: number) {
  if (plan === "free") return false
  return count >= PLAN_LIMITS[plan][period].leaseAnalyses
}

// ── Free-plan upgrade prompt ──────────────────────────────────────────────────
export function shouldBlurFreeCaseAnalysis(createdUnderPlan: PlanId | null | undefined) {
  return createdUnderPlan === "free"
}

export function shouldBlurFreeLetterPreview(createdUnderPlan: PlanId | null | undefined) {
  return createdUnderPlan === "free"
}

export function shouldPromptFreePlanUpgrade(
  userPlan: PlanId | null | undefined,
  generatedCount: number,
) {
  return resolvePlanId(userPlan) === "free" && generatedCount > 0
}
