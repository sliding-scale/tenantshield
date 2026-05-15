export {
  PLAN_LIMITS,
  PRICING_PLANS,
  formatMonthlyPlanPrice,
  formatYearlyPlanPrice,
  formatPlanPrice,
  getPlanPricePeriodSuffix,
  getPlanYearlySavingsPercent,
  getPricingPlanFeatures,
  getPlanCtaHref,
  type PlanId,
  type BillingPeriod,
  type PricingPlan,
  type PricingAudience,
} from "./pricing"

import { PLAN_LIMITS, type BillingPeriod, type PlanId } from "./pricing"

export function getActiveCaseLimit(planId: PlanId, period: BillingPeriod) {
  return PLAN_LIMITS[planId][period].activeCases
}

export function getLetterLimit(planId: PlanId, period: BillingPeriod) {
  return PLAN_LIMITS[planId][period].letters
}

export function getLeaseAnalysisLimit(planId: PlanId, period: BillingPeriod) {
  return PLAN_LIMITS[planId][period].leaseAnalyses
}
