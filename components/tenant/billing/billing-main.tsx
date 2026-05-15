"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { PricingPlansSection } from "@/components/shared/pricing-plans-section"
import { api } from "@/convex/_generated/api"
import { resolvePlanId } from "@/lib/plans/plan-access"
import type { BillingPeriod } from "@/lib/plans/pricing"

export function BillingMain() {
  const { clerkUser, convexUser, isLoading } = useCurrentUser()
  const planUsage = useQuery(
    api.planUsage.queries.current,
    clerkUser ? {} : "skip",
  )

  const defaultBillingPeriod = useMemo((): BillingPeriod | undefined => {
    if (!clerkUser || isLoading) return undefined
    if (planUsage === undefined) return undefined

    const plan = resolvePlanId(convexUser?.plan)
    if (plan !== "pro" && plan !== "power") return "monthly"

    return planUsage?.planType ?? "monthly"
  }, [clerkUser, convexUser?.plan, isLoading, planUsage])

  return (
    <main className="min-h-[100dvh] bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="mb-4 text-center md:mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">
            Billing
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink-warm sm:text-5xl">
            Choose your protection
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-warm-muted sm:text-lg">
            Compare plans, limits, and pricing in one place. Upgrade when you need more cases,
            letters, and lease analyses.
          </p>
        </div>

        <PricingPlansSection
          id="billing-plans"
          audience="billing"
          showBillingPeriodToggle
          defaultBillingPeriod={defaultBillingPeriod}
          className="bg-transparent px-0 py-10 sm:px-0 md:py-12"
        />
      </div>
    </main>
  )
}
