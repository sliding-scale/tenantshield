import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { Button } from "@/components/ui/button"
import { PRICING_PLANS, getPricingPlanFeatures } from "@/lib/plans/plans"
import { useState } from "react"
import { BrandedAlertDialog } from "@/components/ui/branded-alert-dialog"

export function ProfilePlanSection() {
  const { convexUser, isLoading: userLoading } = useCurrentUser()
  const planUsage = useQuery(api.planUsage.queries.current, {})
  const cancelPlan = useMutation(api.planUsage.mutations.cancelPlanForCurrentUser)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const planId = convexUser?.plan ?? "free"
  const planType = planUsage?.planType ?? "monthly"
  const pricingPlan = PRICING_PLANS.find((p) => p.id === planId)
  const planName = pricingPlan?.name ?? "Basic Shield"
  const features = getPricingPlanFeatures(planId, planType)

  const handleCancelPlan = async () => {
    setIsCancelling(true)
    try {
      await cancelPlan()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to cancel plan:", error)
      alert("Failed to cancel plan. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  if (userLoading) {
    return (
      <section className="mt-8 md:mt-10 animate-pulse">
        <div className="h-40 rounded-2xl bg-surface-strong/20 md:rounded-3xl" />
      </section>
    )
  }

  const isPaid = planId === "pro" || planId === "power"

  return (
    <section aria-labelledby="profile-plan-heading" className="mt-8 md:mt-10">
      <h2 id="profile-plan-heading" className="sr-only">
        Plan
      </h2>
      <div className="rounded-2xl border border-surface-strong-hover bg-surface-strong p-5 shadow-sm sm:p-6 md:rounded-3xl md:p-7 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-surface-deep dark:text-ink-warm-muted">
          Plan
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-2xl font-semibold leading-tight text-cream-surface-soft dark:text-ink-warm md:text-3xl lg:text-4xl">
              {planName}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cream-surface-deep dark:text-ink-warm-muted md:text-base lg:text-lg">
              {features.join(" · ")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isPaid && (
              <>
                <Button
                  variant="destructive"
                  size="lg"
                  disabled={isCancelling}
                  onClick={() => setIsDialogOpen(true)}
                  className="h-11 w-full shrink-0 rounded-xl sm:h-12 sm:w-auto sm:min-w-[7.5rem]"
                >
                  Cancel Plan
                </Button>
                <BrandedAlertDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  title="Cancel your paid plan?"
                  description="This will immediately revert your account to the free tier. You will lose access to premium features like unlimited AI tenant guidance and Case analyses."
                  eyebrow="Sensitive Action"
                  eyebrowVariant="destructive"
                  iconVariant="destructive"
                  cancelLabel="Keep my plan"
                  actionLabel="Yes, cancel plan"
                  actionVariant="destructive"
                  onAction={handleCancelPlan}
                  isActionLoading={isCancelling}
                />
              </>
            )}
            <Button
              asChild
              size="lg"
              className="h-11 w-full shrink-0 rounded-xl sm:h-12 sm:w-auto sm:min-w-[7.5rem]"
            >
              <Link href="/billing">
                {isPaid ? "Manage" : "Upgrade"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
