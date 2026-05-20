"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { CheckCircle, ShieldCheck, Sparkles, TimerReset } from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { useSelectPaidPlan } from "@/app/hooks/useSelectPaidPlan"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import {
  buildPlanCatalogLite,
  getOnboardingPlanOption,
  getOnboardingSelectionIdForPlan,
  isPaidPlan,
  onboardingSelectionMatchesActivePlan,
  type OnboardingPlanOption,
  type OnboardingPlanSelectionId,
} from "@/lib/plans/pricing"
import { cn } from "@/lib/utils"

const HERO_BG_URL = "/placeholderhouse.png"

const HERO_CHIPS = [
  {
    icon: Sparkles,
    title: "Fast setup",
    description: "Choose a plan and keep moving.",
  },
  {
    icon: ShieldCheck,
    title: "No surprise billing",
    description: "You get reminders before charges hit.",
  },
  {
    icon: TimerReset,
    title: "Save annually",
    description: "Yearly Pro and Ultimate billing save vs monthly.",
  },
] as const

function SelectionRadio({ selected }: { selected: boolean }) {
  return (
    <div
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary" : "border-border",
      )}
      aria-hidden
    >
      {selected ? <div className="h-3 w-3 rounded-full bg-primary" /> : null}
    </div>
  )
}

function PlanOptionCard({
  option,
  selected,
  isCurrentPlan,
  isSelecting,
  onSelect,
  variant,
}: {
  option: OnboardingPlanOption
  selected: boolean
  isCurrentPlan?: boolean
  isSelecting?: boolean
  onSelect: () => void
  variant: "compact" | "featured"
}) {
  const isFeatured = variant === "featured"

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isSelecting}
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col rounded-[2rem] border text-left transition-all",
        isFeatured ? "max-lg:max-w-md max-lg:mx-auto" : "p-6 lg:p-7",
        isSelecting && "cursor-wait opacity-80",
        selected
          ? "border-primary/40 bg-[#2f2a23] text-white shadow-lg ring-1 ring-primary/25"
          : "border-white/10 bg-[#2f2a23] text-white shadow-sm hover:bg-[#362f27]",
        isCurrentPlan && !selected && "ring-1 ring-primary/20",
      )}
    >
      {isCurrentPlan ? (
        <div className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary-foreground">
          Current plan
        </div>
      ) : null}
      <div
        className={cn(
          "flex w-full gap-3",
          isFeatured
            ? "flex-col px-6 pt-6 sm:flex-row sm:items-start sm:justify-between"
            : "shrink-0 flex-col",
        )}
      >
        <div className="flex items-center gap-3">
          <SelectionRadio selected={selected} />
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-[0.15em]",
              selected ? "text-primary" : "text-white/60",
            )}
          >
            {option.headerLabel}
          </span>
        </div>
        {option.badge ? (
          <div className="w-fit rounded bg-primary px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary-foreground">
            {option.badge}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isFeatured ? "items-center px-6 pb-8 pt-7 sm:pt-8" : "mt-4 flex-1 pl-9",
        )}
      >
        {!isFeatured ? (
          <ul className="mt-4 hidden min-h-0 flex-1 flex-col justify-center gap-2.5 overflow-hidden lg:flex">
            {option.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm leading-snug text-white/80">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className={cn("flex flex-col", isFeatured ? "" : "mt-auto shrink-0 lg:pt-4")}>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "font-heading font-semibold tracking-tight text-white",
              isFeatured ? "text-5xl" : "text-4xl lg:text-[2.75rem]",
            )}
          >
            {option.price}
          </span>
          <span className={cn("text-white/65", isFeatured ? "text-xl" : "text-lg")}>
            {option.suffix}
          </span>
        </div>
        <p
          className={cn(
            "text-sm text-white/70",
            isFeatured ? "mt-3 text-center" : "mt-2",
          )}
        >
          {option.detailDescription}
        </p>

        {isFeatured ? (
          <div className="mt-8 grid w-full gap-3">
            {option.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-[0.95rem] text-white">{feature}</span>
              </div>
            ))}
          </div>
        ) : null}
        </div>
      </div>
    </button>
  )
}

function CheckoutFooter({
  selected,
  isSubmitting,
  isCurrentPlan,
  submitError,
  onContinue,
  className,
}: {
  selected: OnboardingPlanOption
  isSubmitting: boolean
  isCurrentPlan: boolean
  submitError: string | null
  onContinue: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/10 bg-[#2f2a23] p-6 text-white shadow-sm",
        className,
      )}
    >
      {submitError ? (
        <p className="mb-3 text-center text-sm font-medium text-destructive">{submitError}</p>
      ) : null}

      <Button
        type="button"
        disabled={isSubmitting}
        onClick={onContinue}
        className="h-14 w-full rounded-[1.25rem] bg-primary px-6 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 lg:h-[3.75rem] lg:text-xl"
      >
        {isSubmitting
          ? "Updating…"
          : isCurrentPlan
            ? "Continue to dashboard"
            : selected.cta}
      </Button>

      <p className="mt-4 text-center text-[0.8rem] text-muted-foreground">
        Secured by Stripe · Cancel anytime on paid plans
      </p>

      <div className="mt-4 text-center">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Not now — go to dashboard
        </Link>
      </div>
    </div>
  )
}

export function OnboardingPlansMain() {
  const router = useRouter()
  const { clerkUser, convexUser, isLoading: isUserLoading } = useCurrentUser()
  const planUsage = useQuery(api.planUsage.queries.current, clerkUser ? {} : "skip")
  const catalogRows = useQuery(api.planCatalog.queries.list, clerkUser ? {} : "skip")
  const { selectPaidPlan, isSelecting: isSelectingPlan } = useSelectPaidPlan()
  const [selectedId, setSelectedId] = useState<OnboardingPlanSelectionId>("pro-yearly")
  const [isContinuing, setIsContinuing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isSubmitting = isSelectingPlan || isContinuing

  const catalogLite = useMemo(() => buildPlanCatalogLite(catalogRows ?? []), [catalogRows])

  const activePlanId =
    clerkUser && !isUserLoading && planUsage != null ? planUsage.plan : null
  const activePlanType = planUsage?.planType ?? null

  const selected = useMemo(
    () => getOnboardingPlanOption(selectedId, catalogLite),
    [selectedId, catalogLite],
  )

  const isCurrentSelection = useMemo(() => {
    if (!activePlanId) return false
    return onboardingSelectionMatchesActivePlan(selectedId, activePlanId, activePlanType, catalogLite)
  }, [activePlanId, activePlanType, selectedId, catalogLite])

  useEffect(() => {
    if (isUserLoading || !clerkUser || planUsage === undefined || catalogRows === undefined || !activePlanId)
      return

    if (isPaidPlan(activePlanId)) {
      router.replace("/billing")
      return
    }

    const matchedSelection = getOnboardingSelectionIdForPlan(activePlanId, activePlanType)
    if (matchedSelection) {
      setSelectedId(matchedSelection)
    }
  }, [activePlanId, activePlanType, catalogRows, clerkUser, isUserLoading, planUsage, router])

  const applySelectedPlan = async () => {
    setSubmitError(null)
    setIsContinuing(true)
    try {
      if (!isCurrentSelection) {
        await selectPaidPlan({
          plan: selected.planId,
          planType: selected.billingPeriod,
          checkoutSource: "onboarding",
        })
        return
      }
      router.push("/dashboard")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update plan"
      setSubmitError(message)
      console.error(error)
    } finally {
      setIsContinuing(false)
    }
  }

  const handlePlanSelect = (id: OnboardingPlanSelectionId) => {
    setSelectedId(id)
    setSubmitError(null)
  }

  const renderPlan = (id: OnboardingPlanSelectionId, variant: "compact" | "featured") => {
    const option = getOnboardingPlanOption(id, catalogLite)
    return (
      <div key={id} className={cn(variant === "compact" && "h-full min-h-0")}>
        <PlanOptionCard
          option={option}
          selected={selectedId === id}
          isCurrentPlan={
            activePlanId !== null &&
            onboardingSelectionMatchesActivePlan(id, activePlanId, activePlanType, catalogLite)
          }
          isSelecting={isSubmitting && selectedId === id}
          onSelect={() => handlePlanSelect(id)}
          variant={variant}
        />
      </div>
    )
  }

  if (
    isUserLoading ||
    !clerkUser ||
    planUsage === undefined ||
    catalogRows === undefined ||
    (activePlanId !== null && isPaidPlan(activePlanId))
  ) {
    return <ShieldLoader variant="onboarding" fullPage className="min-h-svh" />
  }

  return (
    <main className="min-h-svh w-full bg-background text-foreground">
      <div
        className="relative overflow-hidden border-b border-border bg-cover bg-center px-6 pb-10 pt-16 md:px-10 lg:px-12 lg:pb-14 lg:pt-20"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15,15,15,0.32), rgba(15,15,15,0.9)), url('${HERO_BG_URL}')`,
        }}
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-14">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
              Unlock TenantShield
            </p>
            <h1 className="font-heading text-[3.25rem] font-semibold leading-[1.02] text-white text-balance sm:text-6xl lg:text-6xl xl:text-7xl">
              Pick your
              <br />
              protection.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-snug text-white/90 lg:text-xl">
              Full access unlocks the moment you subscribe. Cancel anytime.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
            {HERO_CHIPS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-[#2f2a23]/90 p-4 text-white shadow-sm backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 lg:px-12 lg:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-stretch lg:gap-10 xl:grid-cols-[minmax(0,24rem)_1fr] xl:gap-12">
          <aside className="max-lg:mx-auto max-lg:max-w-md lg:sticky lg:top-8">
            <div className="rounded-[2rem] border border-white/10 bg-[#2f2a23] p-6 text-white shadow-sm lg:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Current selection
              </p>
              <h2 className="mt-3 font-heading text-2xl font-semibold text-white sm:text-3xl">
                {selected.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{selected.description}</p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white p-5 text-foreground shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  {selected.kicker}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-heading text-4xl font-semibold tracking-tight lg:text-5xl">
                    {selected.price}
                  </span>
                  <span className="text-lg text-muted-foreground">{selected.suffix}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {selected.detailDescription}
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                {selected.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3"
                  >
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed text-white">{feature}</span>
                  </div>
                ))}
              </div>

              <CheckoutFooter
                selected={selected}
                isSubmitting={isSubmitting}
                isCurrentPlan={isCurrentSelection}
                submitError={submitError}
                onContinue={() => void applySelectedPlan()}
                className="mt-8 hidden lg:block"
              />
            </div>
          </aside>

          <section className="mt-8 flex flex-col space-y-4 max-lg:mx-auto max-lg:max-w-md lg:mt-0 lg:min-h-0 lg:flex-1 lg:space-y-5">
            <div className="hidden lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Compare plans
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Yearly billing saves the most. Monthly stays flexible.
              </p>
            </div>

            {/* Mobile: featured stack + compact row */}
            <div className="space-y-4 lg:hidden">
              {renderPlan("pro-yearly", "featured")}
              {renderPlan("power-yearly", "featured")}
              <div className="grid gap-4 sm:grid-cols-2">
                {renderPlan("pro-monthly", "compact")}
                {renderPlan("power-monthly", "compact")}
              </div>
              <CheckoutFooter
                selected={selected}
                isSubmitting={isSubmitting}
                isCurrentPlan={isCurrentSelection}
                submitError={submitError}
                onContinue={() => void applySelectedPlan()}
              />
            </div>

            {/* Desktop: 2×2 compact grid */}
            <div className="hidden min-h-0 flex-1 gap-4 lg:grid lg:grid-cols-2 lg:grid-rows-2 lg:gap-5 lg:auto-rows-fr">
              {renderPlan("pro-yearly", "compact")}
              {renderPlan("power-yearly", "compact")}
              {renderPlan("pro-monthly", "compact")}
              {renderPlan("power-monthly", "compact")}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
