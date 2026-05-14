"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { Check } from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api"
import {
  formatPlanPrice,
  formatYearlyPlanPrice,
  getPlanCtaHref,
  getPlanPricePeriodSuffix,
  getPlanYearlySavingsPercent,
  getPricingPlanFeatures,
  PRICING_PLANS,
  type BillingPeriod,
  type PlanId,
} from "@/lib/plans/plans"
import { resolvePlanId } from "@/lib/plans/plan-access"
import { cn } from "@/lib/utils"

type PricingPlansSectionProps = {
  id?: string
  title?: string
  subtitle?: string
  audience?: "landing" | "billing"
  showBillingPeriodToggle?: boolean
  defaultBillingPeriod?: BillingPeriod
  className?: string
}

function BillingPeriodToggle({
  billingPeriod,
  onChange,
}: {
  billingPeriod: BillingPeriod
  onChange: (period: BillingPeriod) => void
}) {
  return (
    <div
      className="mx-auto mb-10 flex w-full max-w-md flex-col items-center gap-3 sm:mb-12"
      role="group"
      aria-label="Billing period"
    >
      <div className="inline-flex w-full rounded-full border border-cream-border bg-cream-surface p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={cn(
            "h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors",
            billingPeriod === "monthly"
              ? "bg-surface-strong text-white"
              : "text-ink-warm hover:text-foreground",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange("yearly")}
          className={cn(
            "h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors",
            billingPeriod === "yearly"
              ? "bg-surface-strong text-white"
              : "text-ink-warm hover:text-foreground",
          )}
        >
          Yearly
        </button>
      </div>
      <p className="text-sm text-ink-warm-muted">Save with annual billing on paid plans.</p>
    </div>
  )
}

function PricingPlanCard({
  id: planId,
  name,
  cta,
  popular,
  trial,
  audience,
  billingPeriod = "monthly",
  isCurrentPlan = false,
  onSelectPlan,
  isSelecting = false,
}: (typeof PRICING_PLANS)[number] & {
  audience: "landing" | "billing"
  billingPeriod?: BillingPeriod
  isCurrentPlan?: boolean
  onSelectPlan?: (planId: PlanId) => void
  isSelecting?: boolean
}) {
  const displayPrice = formatPlanPrice(planId, billingPeriod)
  const priceSuffix = getPlanPricePeriodSuffix(planId, billingPeriod)
  const yearlyReference =
    billingPeriod === "monthly" ? formatYearlyPlanPrice(planId) : null
  const yearlySavingsPercent =
    billingPeriod === "yearly" ? getPlanYearlySavingsPercent(planId) : null
  const displayFeatures = getPricingPlanFeatures(planId, billingPeriod)
  const href = getPlanCtaHref(planId, audience)
  const usesBillingSelection =
    audience === "billing" && planId !== "free" && Boolean(onSelectPlan)
  const ctaClassName = cn(
    "block w-full rounded-full px-4 py-3 text-center text-sm font-bold transition-all duration-200 active:scale-95",
    popular
      ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:shadow-lg"
      : "border-2 border-gray-300 bg-white text-gray-700 hover:border-amber-500 hover:text-amber-600",
  )

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 bg-white p-8 transition-all duration-300",
        isCurrentPlan
          ? "border-primary shadow-md ring-2 ring-primary/15"
          : popular
            ? "border-amber-500 hover:border-amber-500 hover:shadow-lg"
            : "border-gray-200 hover:border-amber-200 hover:shadow-lg",
      )}
    >
      {isCurrentPlan ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
          Current plan
        </div>
      ) : popular ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
          Most Popular
        </div>
      ) : null}

      {yearlySavingsPercent ? (
        <div className="absolute top-4 right-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          Save {yearlySavingsPercent}%
        </div>
      ) : null}

      <h3 className="mb-2 text-xl font-bold text-gray-900">{name}</h3>

      <div className="mb-6">
        <span className="text-3xl font-bold text-gray-900">{displayPrice}</span>
        {priceSuffix ? <span className="text-sm text-gray-600">{priceSuffix}</span> : null}
        {yearlyReference ? <p className="mt-2 text-sm font-medium text-gray-600">{yearlyReference}</p> : null}
        {trial && billingPeriod === "monthly" ? (
          <p className="mt-2 text-xs font-medium text-gray-500">{trial}</p>
        ) : null}
      </div>

      <ul className="mb-8 space-y-3">
        {displayFeatures.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <div
          className={cn(
            "block w-full rounded-full px-4 py-3 text-center text-sm font-bold",
            popular
              ? "bg-amber-500/80 text-white shadow-md"
              : "border-2 border-gray-300 bg-gray-50 text-gray-500",
          )}
          aria-current="true"
        >
          Current plan
        </div>
      ) : usesBillingSelection ? (
        <button
          type="button"
          disabled={isSelecting}
          onClick={() => onSelectPlan?.(planId)}
          className={cn(ctaClassName, isSelecting && "cursor-wait opacity-80")}
        >
          {isSelecting ? "Updating..." : cta}
        </button>
      ) : (
        <Link href={href} className={ctaClassName}>
          {cta}
        </Link>
      )}
    </div>
  )
}

export function PricingPlansSection({
  id = "pricing",
  title = "Start Your Protection Today",
  subtitle = "Choose the level of advocacy that fits your rental needs. Protect yourself from unfair practices.",
  audience = "landing",
  showBillingPeriodToggle = false,
  defaultBillingPeriod,
  className,
}: PricingPlansSectionProps) {
  const { clerkUser, convexUser, isLoading } = useCurrentUser()
  const selectPlan = useMutation(api.planUsage.mutations.selectPlanForCurrentUser)
  const activeUserPlanId =
    clerkUser && !isLoading ? resolvePlanId(convexUser?.plan) : null
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [pendingPlanId, setPendingPlanId] = useState<PlanId | null>(null)
  const hasAppliedDefaultBillingPeriod = useRef(false)

  useEffect(() => {
    if (
      !showBillingPeriodToggle ||
      hasAppliedDefaultBillingPeriod.current ||
      defaultBillingPeriod === undefined
    ) {
      return
    }

    setBillingPeriod(defaultBillingPeriod)
    hasAppliedDefaultBillingPeriod.current = true
  }, [defaultBillingPeriod, showBillingPeriodToggle])
  const handleSelectPlan = async (planId: PlanId) => {
    if (audience !== "billing" || planId === "free") return

    setPendingPlanId(planId)
    try {
      await selectPlan({ plan: planId, planType: billingPeriod })
    } finally {
      setPendingPlanId(null)
    }
  }
  const [carouselIndex, setCarouselIndex] = useState(1)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStart(event.targetTouches[0].clientX)
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    setTouchEnd(event.changedTouches[0].clientX)
    if (touchStart - touchEnd > 50) {
      setCarouselIndex((previous) => (previous + 1) % PRICING_PLANS.length)
    }
    if (touchEnd - touchStart > 50) {
      setCarouselIndex((previous) => (previous - 1 + PRICING_PLANS.length) % PRICING_PLANS.length)
    }
  }

  return (
    <section id={id} className={cn("px-4 py-20 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>

        {showBillingPeriodToggle ? (
          <BillingPeriodToggle billingPeriod={billingPeriod} onChange={setBillingPeriod} />
        ) : null}

        <div className="lg:hidden">
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {PRICING_PLANS.map((plan) => (
                <div key={plan.id} className="w-full shrink-0 px-4">
                  <PricingPlanCard
                    {...plan}
                    audience={audience}
                    billingPeriod={showBillingPeriodToggle ? billingPeriod : "monthly"}
                    isCurrentPlan={activeUserPlanId === plan.id}
                    onSelectPlan={audience === "billing" ? handleSelectPlan : undefined}
                    isSelecting={pendingPlanId === plan.id}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {PRICING_PLANS.map((plan, index) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setCarouselIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === carouselIndex ? "w-8 bg-amber-500" : "w-2 bg-gray-300 hover:bg-gray-400",
                )}
                aria-label={`Go to ${plan.name}`}
              />
            ))}
          </div>
        </div>

        <div className="hidden gap-8 lg:grid lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingPlanCard
              key={plan.id}
              {...plan}
              audience={audience}
              billingPeriod={showBillingPeriodToggle ? billingPeriod : "monthly"}
              isCurrentPlan={activeUserPlanId === plan.id}
              onSelectPlan={audience === "billing" ? handleSelectPlan : undefined}
              isSelecting={pendingPlanId === plan.id}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
