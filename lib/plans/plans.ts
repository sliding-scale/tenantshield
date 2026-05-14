export const PLAN_LIMITS = {
  free: {
    monthly: {
      cost: 0,
      activeCases: 0,
      leaseAnalyses: 0,
      letters: 0,
    },
    yearly: {
      cost: 0,
      activeCases: 0,
      leaseAnalyses: 0,
      letters: 0,
    },
  },

  pro: {
    monthly: {
      cost: 14.99,
      activeCases: 2,
      leaseAnalyses: 2,
      letters: 2,
    },
    yearly: {
      cost: 136,
      activeCases: 2,
      leaseAnalyses: 2,
      letters: 2,
    },
  },

  power: {
    monthly: {
      cost: 29.99,
      activeCases: 10,
      leaseAnalyses: 10,
      letters: 10,
    },
    yearly: {
      cost: 239,
      activeCases: 10,
      leaseAnalyses: 10,
      letters: 10,
    },
  },
} as const

export type PlanId = keyof typeof PLAN_LIMITS

export type BillingPeriod = "monthly" | "yearly"

export function getActiveCaseLimit(planId: PlanId, period: BillingPeriod) {
  return PLAN_LIMITS[planId][period].activeCases
}

export function getLetterLimit(planId: PlanId, period: BillingPeriod) {
  return PLAN_LIMITS[planId][period].letters
}

export function getLeaseAnalysisLimit(planId: PlanId, period: BillingPeriod) {
  return PLAN_LIMITS[planId][period].leaseAnalyses
}

export type PricingPlan = {
  id: PlanId
  name: string
  features: string[]
  cta: string
  popular?: boolean
  trial?: string
}

function formatCost(cost: number) {
  return Number.isInteger(cost) ? `${cost}` : cost.toFixed(2)
}

export function formatMonthlyPlanPrice(planId: PlanId) {
  const cost = PLAN_LIMITS[planId].monthly.cost
  if (cost === 0) return "Free"
  return `$${formatCost(cost)}`
}

export function formatYearlyPlanPrice(planId: PlanId) {
  const cost = PLAN_LIMITS[planId].yearly.cost
  if (cost === 0) return null
  return `$${formatCost(cost)}/year`
}

export function formatPlanPrice(planId: PlanId, period: BillingPeriod) {
  const cost = PLAN_LIMITS[planId][period].cost
  if (cost === 0) return "Free"
  return `$${formatCost(cost)}`
}

export function getPlanPricePeriodSuffix(planId: PlanId, period: BillingPeriod) {
  if (PLAN_LIMITS[planId][period].cost === 0) return null
  return period === "yearly" ? "/year" : "/mo"
}

export function getPlanYearlySavingsPercent(planId: PlanId) {
  const monthlyCost = PLAN_LIMITS[planId].monthly.cost
  const yearlyCost = PLAN_LIMITS[planId].yearly.cost
  if (monthlyCost === 0 || yearlyCost === 0) return null

  const annualMonthlyTotal = monthlyCost * 12
  if (annualMonthlyTotal <= yearlyCost) return null

  return Math.round(((annualMonthlyTotal - yearlyCost) / annualMonthlyTotal) * 100)
}

function planLimitFeatures(
  limits: (typeof PLAN_LIMITS)[PlanId][BillingPeriod],
  period: BillingPeriod,
) {
  const unit = period === "yearly" ? "per year" : "per month"

  return [
    `${limits.activeCases} active cases`,
    `${limits.leaseAnalyses} lease analyses ${unit}`,
    `${limits.letters} letters ${unit}`,
    "Letter export and priority responses",
  ]
}

export function getPricingPlanFeatures(planId: PlanId, period: BillingPeriod) {
  if (planId === "free") {
    return [
      "Limited AI tenant guidance",
      "Start a case only",
      "Upload leases only",
      "Preview letters only",
    ]
  }

  return [
    "Unlimited AI tenant guidance",
    ...planLimitFeatures(PLAN_LIMITS[planId][period], period),
  ]
}

function monthlyLimitFeatures(limits: (typeof PLAN_LIMITS)[PlanId]["monthly"]) {
  return planLimitFeatures(limits, "monthly")
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Basic Shield",
    cta: "Get Started",
    features: [
      "Limited AI tenant guidance",
      "Start a case only",
      "Upload leases only",
      "Preview letters only",
    ],
  },
  {
    id: "pro",
    name: "Pro Shield",
    // cta: "Start Free Trial",
    cta: "Choose Pro",
    popular: true,
    // trial: "3-Day Free Trial",
    features: ["Unlimited AI tenant guidance", ...monthlyLimitFeatures(PLAN_LIMITS.pro.monthly)],
  },
  {
    id: "power",
    name: "Ultimate Shield",
    cta: "Choose Ultimate",
    features: ["Unlimited AI tenant guidance", ...monthlyLimitFeatures(PLAN_LIMITS.power.monthly)],
  },
]

export function getPlanCtaHref(planId: PlanId, audience: "landing" | "billing") {
  if (audience === "landing") {
    return planId === "free" ? "/signup" : "/onboarding/plans"
  }

  return planId === "free" ? "/dashboard" : "/onboarding/plans"
}
