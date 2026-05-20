"use client"

import Link from "next/link"
import { useAction, useQuery } from "convex/react"
import { useState } from "react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PRICING_PLANS, buildPlanCatalogLite, getPricingPlanFeatures, isPaidPlan } from "@/lib/plans/pricing"
import { subscriptionCancellationMessage } from "@/lib/plans/subscription-display"
import { cn } from "@/lib/utils"

export function ProfilePlanSection() {
  const { convexUser, isLoading: userLoading } = useCurrentUser()
  const planUsage = useQuery(api.planUsage.queries.current, {})
  const catalogRows = useQuery(api.planCatalog.queries.list, {})
  const openBillingPortal = useAction(api.stripe.node.createBillingPortalSession)
  const [portalLoading, setPortalLoading] = useState(false)

  const planId = planUsage?.plan ?? convexUser?.plan ?? "free"
  const planType = planUsage?.planType ?? "monthly"
  const catalogLite = buildPlanCatalogLite(catalogRows ?? [])
  const fromCatalog = catalogLite?.[planId]
  const pricingPlan = PRICING_PLANS.find((p) => p.id === planId)
  const planName = fromCatalog?.name ?? pricingPlan?.name ?? "Basic Shield"
  const features = fromCatalog?.features ?? getPricingPlanFeatures(planId, planType)
  const cancellationNotice =
    planUsage?.cancelAtPeriodEnd && planUsage.currentPeriodEnd !== undefined
      ? subscriptionCancellationMessage(true, planUsage.currentPeriodEnd)
      : null

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const { url } = await openBillingPortal({})
      window.location.assign(url)
    } catch (error) {
      console.error("Failed to open billing portal:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Could not open billing portal. Try again or use Billing from the menu.",
      )
    } finally {
      setPortalLoading(false)
    }
  }

  if (userLoading) {
    return (
      <section className="mt-6 animate-pulse md:mt-8" aria-hidden>
        <div className="h-36 rounded-2xl bg-primary/30 md:rounded-3xl" />
      </section>
    )
  }

  const isPaid = isPaidPlan(planId)

  return (
    <section aria-labelledby="profile-plan-heading" className="mt-6 md:mt-8">
      <h2 id="profile-plan-heading" className="sr-only">
        Plan
      </h2>
      <Card
        className={cn(
          "gap-0 overflow-hidden rounded-2xl border-0 bg-primary p-5 text-primary-foreground shadow-none ring-0 md:rounded-3xl md:p-6",
        )}
        size="sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-2xl font-semibold leading-tight md:text-3xl">{planName}</p>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90 md:text-base">
              {features.join(" · ")}
            </p>
            {cancellationNotice ? (
              <p className="mt-3 rounded-xl bg-primary-foreground/10 px-3 py-2 text-sm leading-relaxed text-primary-foreground/90">
                {cancellationNotice}
              </p>
            ) : null}
          </div>
          {isPaid ? (
            <Button
              type="button"
              variant="cta"
              disabled={portalLoading}
              onClick={() => void handleManageBilling()}
              className="h-10 shrink-0 rounded-xl px-4 text-sm font-semibold sm:h-11 sm:px-5"
            >
              {portalLoading ? "Opening…" : "Manage"}
            </Button>
          ) : (
            <Button
              asChild
              variant="cta"
              className="h-10 shrink-0 rounded-xl px-4 text-sm font-semibold sm:h-11 sm:px-5"
            >
              <Link href="/billing">Upgrade</Link>
            </Button>
          )}
        </div>
      </Card>
    </section>
  )
}
