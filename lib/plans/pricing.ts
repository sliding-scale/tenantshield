/** Single source of truth for plan costs, limits, and pricing UI copy. */

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

export type PaidPlanId = Exclude<PlanId, "free">

export type BillingPeriod = "monthly" | "yearly"

export type CheckoutSource = "onboarding" | "billing"

export type SelectPaidPlanInput = {
  plan: PaidPlanId
  planType: BillingPeriod
  checkoutSource: CheckoutSource
}

export type PricingPlan = {
  id: PlanId
  name: string
  features: string[]
  cta: string
  popular?: boolean
  trial?: string
}

/** Convex `planCatalog` rows mapped by tier for UI copy (names, feature bullets, CTAs). */
export type PlanCatalogLite = Record<
  PlanId,
  { name: string; features: string[]; cta: string; popular?: boolean }
>

export function buildPlanCatalogLite(
  rows: Array<{
    tier: PlanId
    name: string
    features: string[]
    cta: string
    popular?: boolean
  }>,
): PlanCatalogLite | null {
  if (rows.length === 0) return null
  const lite = {} as PlanCatalogLite
  for (const row of rows) {
    lite[row.tier] = {
      name: row.name,
      features: row.features,
      cta: row.cta,
      popular: row.popular,
    }
  }
  return lite
}

/** Ordered free → pro → power; fills missing tiers from static `PRICING_PLANS`. */
export function pricingPlansListFromCatalog(lite: PlanCatalogLite | null | undefined): PricingPlan[] {
  const order: PlanId[] = ["free", "pro", "power"]
  return order.map((id) => {
    const fromCatalog = lite?.[id]
    if (fromCatalog) {
      return {
        id,
        name: fromCatalog.name,
        features: fromCatalog.features,
        cta: fromCatalog.cta,
        popular: fromCatalog.popular,
      }
    }
    const fallback = PRICING_PLANS.find((p) => p.id === id)
    if (!fallback) {
      throw new Error(`Missing pricing plan for tier: ${id}`)
    }
    return fallback
  })
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

function planLimitFeatures(limits: (typeof PLAN_LIMITS)[PlanId][BillingPeriod]) {
  return [
    `${limits.activeCases} active cases`,
    `${limits.leaseAnalyses} lease analyses per month`,
    `${limits.letters} letters per month`,
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
    ...planLimitFeatures(PLAN_LIMITS[planId][period]),
  ]
}

function monthlyLimitFeatures(limits: (typeof PLAN_LIMITS)[PlanId]["monthly"]) {
  return planLimitFeatures(limits)
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
    cta: "Choose Pro",
    popular: true,
    features: ["Unlimited AI tenant guidance", ...monthlyLimitFeatures(PLAN_LIMITS.pro.monthly)],
  },
  {
    id: "power",
    name: "Ultimate Shield",
    cta: "Choose Ultimate",
    features: ["Unlimited AI tenant guidance", ...monthlyLimitFeatures(PLAN_LIMITS.power.monthly)],
  },
]

export type PricingAudience = "landing" | "billing" | "onboarding"

export function getPlanCtaHref(planId: PlanId, audience: PricingAudience) {
  if (audience === "landing") {
    return planId === "free" ? "/signup" : "/onboarding/plans"
  }

  if (audience === "onboarding") {
    return planId === "free" ? "/dashboard" : "/dashboard"
  }

  return planId === "free" ? "/dashboard" : "/onboarding/plans"
}

/** Onboarding picker keys — maps the original 3-card UI to paid plans in PLAN_LIMITS. */
export type OnboardingPlanSelectionId =
  | "pro-yearly"
  | "power-yearly"
  | "pro-monthly"
  | "power-monthly"

export type OnboardingPlanOption = {
  id: OnboardingPlanSelectionId
  planId: Exclude<PlanId, "free">
  billingPeriod: BillingPeriod
  title: string
  kicker: string
  headerLabel: string
  price: string
  suffix: string
  description: string
  detailDescription: string
  badge?: string
  features: string[]
  cta: string
}

function paidPlanDisplayName(planId: Exclude<PlanId, "free">, catalog?: PlanCatalogLite | null) {
  return catalog?.[planId]?.name ?? PRICING_PLANS.find((plan) => plan.id === planId)?.name ?? planId
}

function monthlyEquivalentYearlyCost(planId: Exclude<PlanId, "free">) {
  const yearlyCost = PLAN_LIMITS[planId].yearly.cost
  return yearlyCost / 12
}

/** Options for the onboarding plans page (original layout, shared pricing model). */
export function getOnboardingPlanOptions(catalog?: PlanCatalogLite | null): OnboardingPlanOption[] {
  const proYearlySavings = getPlanYearlySavingsPercent("pro")
  const powerYearlySavings = getPlanYearlySavingsPercent("power")
  const proYearlyPrice = formatPlanPrice("pro", "yearly")
  const powerYearlyPrice = formatPlanPrice("power", "yearly")
  const proMonthlyPrice = formatPlanPrice("pro", "monthly")
  const powerMonthlyPrice = formatPlanPrice("power", "monthly")
  const proMonthlyEquiv = monthlyEquivalentYearlyCost("pro")
  const powerMonthlyEquiv = monthlyEquivalentYearlyCost("power")
  const powerName = paidPlanDisplayName("power", catalog)
  const proName = paidPlanDisplayName("pro", catalog)

  const proCta = catalog?.pro?.cta ?? PRICING_PLANS.find((p) => p.id === "pro")?.cta ?? "Choose Pro"
  const powerCta = catalog?.power?.cta ?? PRICING_PLANS.find((p) => p.id === "power")?.cta ?? "Choose Ultimate"

  return [
    {
      id: "pro-yearly",
      planId: "pro",
      billingPeriod: "yearly",
      title: `${proName} · Yearly`,
      kicker: "Annual billing",
      headerLabel: "Yearly — Best value",
      price: proYearlyPrice,
      suffix: "/year",
      description: `${proYearlyPrice}/year · About $${formatCost(proMonthlyEquiv)}/mo`,
      detailDescription: `${proYearlyPrice}/year · About $${formatCost(proMonthlyEquiv)}/mo`,
      badge: proYearlySavings ? `Best Value — Save ${proYearlySavings}%` : "Best Value",
      features: catalog?.pro?.features ?? getPricingPlanFeatures("pro", "yearly"),
      cta: proCta,
    },
    {
      id: "power-yearly",
      planId: "power",
      billingPeriod: "yearly",
      title: `${powerName} · Yearly`,
      kicker: "Annual billing",
      headerLabel: `${powerName} · Yearly`,
      price: powerYearlyPrice,
      suffix: "/year",
      description: `${powerYearlyPrice}/year · About $${formatCost(powerMonthlyEquiv)}/mo`,
      detailDescription: `${powerYearlyPrice}/year · About $${formatCost(powerMonthlyEquiv)}/mo · Highest limits`,
      badge: powerYearlySavings ? `Save ${powerYearlySavings}%` : "Highest limits",
      features: catalog?.power?.features ?? getPricingPlanFeatures("power", "yearly"),
      cta: powerCta,
    },
    {
      id: "pro-monthly",
      planId: "pro",
      billingPeriod: "monthly",
      title: `${proName} · Monthly`,
      kicker: "Pay monthly",
      headerLabel: "Monthly",
      price: proMonthlyPrice,
      suffix: "/mo",
      description: `${proName} · Cancel anytime`,
      detailDescription: `${proName} · Cancel anytime`,
      features: catalog?.pro?.features ?? getPricingPlanFeatures("pro", "monthly"),
      cta: proCta,
    },
    {
      id: "power-monthly",
      planId: "power",
      billingPeriod: "monthly",
      title: powerName,
      kicker: "Pay monthly",
      headerLabel: powerName,
      price: powerMonthlyPrice,
      suffix: "/mo",
      description: `Highest limits · Cancel anytime`,
      detailDescription: `Highest limits · Cancel anytime`,
      features: catalog?.power?.features ?? getPricingPlanFeatures("power", "monthly"),
      cta: powerCta,
    },
  ]
}

export function getOnboardingPlanOption(id: OnboardingPlanSelectionId, catalog?: PlanCatalogLite | null) {
  const option = getOnboardingPlanOptions(catalog).find((entry) => entry.id === id)
  if (!option) {
    throw new Error(`Unknown onboarding plan: ${id}`)
  }
  return option
}

export function isPaidPlan(planId: PlanId) {
  return planId === "pro" || planId === "power"
}

export function getOnboardingSelectionIdForPlan(
  planId: PlanId,
  planType: BillingPeriod | null | undefined,
): OnboardingPlanSelectionId | null {
  if (planId === "pro" && planType === "yearly") return "pro-yearly"
  if (planId === "pro" && planType === "monthly") return "pro-monthly"
  if (planId === "power" && planType === "yearly") return "power-yearly"
  if (planId === "power" && planType === "monthly") return "power-monthly"
  return null
}

export function onboardingSelectionMatchesActivePlan(
  selectionId: OnboardingPlanSelectionId,
  planId: PlanId,
  planType: BillingPeriod | null | undefined,
  catalog?: PlanCatalogLite | null,
) {
  if (!isPaidPlan(planId) || !planType) return false
  const option = getOnboardingPlanOption(selectionId, catalog)
  return option.planId === planId && option.billingPeriod === planType
}
