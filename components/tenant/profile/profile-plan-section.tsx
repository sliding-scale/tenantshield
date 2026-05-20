import Link from "next/link"
import { useAction, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { Button } from "@/components/ui/button"
import { PRICING_PLANS, buildPlanCatalogLite, getPricingPlanFeatures } from "@/lib/plans/pricing"
import { subscriptionCancellationMessage } from "@/lib/plans/subscription-display"
import { useState } from "react"

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
      <section className="mt-8 md:mt-10 animate-pulse">
        <div className="h-40 rounded-2xl bg-foreground/20 md:rounded-3xl" />
      </section>
    )
  }

  const isPaid = planId === "pro" || planId === "power"

  return (
    <section aria-labelledby="profile-plan-heading" className="mt-8 md:mt-10">
      <h2 id="profile-plan-heading" className="sr-only">
        Plan
      </h2>
      <div className="rounded-2xl border border-foreground-hover bg-foreground p-5 shadow-sm sm:p-6 md:rounded-3xl md:p-7 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted dark:text-muted-foreground">
          Plan
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-2xl font-semibold leading-tight text-background dark:text-foreground md:text-3xl lg:text-4xl">
              {planName}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted dark:text-muted-foreground md:text-base lg:text-lg">
              {features.join(" · ")}
            </p>
            {cancellationNotice ? (
              <p className="mt-3 max-w-3xl rounded-xl border border-border bg-background/40 px-3 py-2 text-sm leading-relaxed text-muted dark:text-muted-foreground">
                {cancellationNotice}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isPaid ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={portalLoading}
                onClick={() => void handleManageBilling()}
                className="h-11 w-full shrink-0 rounded-xl sm:h-12 sm:w-auto sm:min-w-[7.5rem]"
              >
                {portalLoading ? "Opening…" : "Manage billing"}
              </Button>
            ) : null}
            <Button
              asChild
              size="lg"
              className="h-11 w-full shrink-0 rounded-xl sm:h-12 sm:w-auto sm:min-w-[7.5rem]"
            >
              <Link href="/billing">{isPaid ? "Compare plans" : "Upgrade"}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
