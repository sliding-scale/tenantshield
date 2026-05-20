"use client"

import { useState, type ComponentType } from "react"
import { useQuery } from "convex/react"
import {
  AlertTriangle,
  CircleHelp,
  FileText,
  Gavel,
  Scale,
  Shield,
  TrendingUp,
  Wrench,
} from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api"
import { GavelLoaderOverlay } from "@/components/shared/gavel-loader"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { StatePickerField } from "@/components/shared/state-picker-field"
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/tenant/new-case/floating-label-field"
import { PlanUpgradeDialog } from "@/components/tenant/free-plan-upgrade-dialog"
import { Button } from "@/components/ui/button"
import {
  ISSUE_TYPES,
  type IssueTypeIconKey,
} from "@/lib/constants/issue-types"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import {
  ACTIVE_CASE_LIMIT_REACHED,
  hasReachedActiveCaseLimit,
  resolvePlanId,
  shouldPromptFreePlanUpgrade,
} from "@/lib/plans/plan-access"
import { getActiveCaseLimit } from "@/lib/plans/plans"
import { cn } from "@/lib/utils"

const ISSUE_TYPE_ICONS: Record<
  IssueTypeIconKey,
  ComponentType<{ className?: string }>
> = {
  gavel: Gavel,
  wrench: Wrench,
  "alert-triangle": AlertTriangle,
  "trending-up": TrendingUp,
  "file-text": FileText,
  shield: Shield,
  scale: Scale,
  "circle-help": CircleHelp,
}

const fieldClass =
  "h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

type NewCaseFormProps = {
  issueType: string
  setIssueType: (value: string) => void
  title: string
  setTitle: (value: string) => void
  description: string
  setDescription: (value: string) => void
  state: string
  setState: (value: string) => void
  city: string
  setCity: (value: string) => void
  landlord: string
  setLandlord: (value: string) => void
  propertyAddress: string
  setPropertyAddress: (value: string) => void
  error: string | null
  canSubmit: boolean
  isSubmitting: boolean
  onSubmit: () => void | Promise<void>
  isStateReady?: boolean
}

export function NewCaseForm({
  issueType,
  setIssueType,
  title,
  setTitle,
  description,
  setDescription,
  state,
  setState,
  city,
  setCity,
  landlord,
  setLandlord,
  propertyAddress,
  setPropertyAddress,
  error,
  canSubmit,
  isSubmitting,
  onSubmit,
  isStateReady = true,
}: NewCaseFormProps) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [upgradeDialogMode, setUpgradeDialogMode] = useState<"free" | "active-limit">("free")
  const { convexUser } = useCurrentUser()
  const counts = useQuery(api.dashboard.queries.countsForCurrentUser, {})
  const planUsage = useQuery(api.planUsage.queries.current, {})
  const plan = resolvePlanId(planUsage?.plan ?? convexUser?.plan)
  const billingPeriod = planUsage?.planType ?? "monthly"
  const usedActiveCases = planUsage?.usedActiveCases ?? 0
  const activeCaseLimit = getActiveCaseLimit(plan, billingPeriod)

  const handleSubmitClick = async () => {
    const generatedCaseCount = counts?.totalCases ?? 0
    if (shouldPromptFreePlanUpgrade(plan, generatedCaseCount)) {
      setUpgradeDialogMode("free")
      setUpgradeDialogOpen(true)
      return
    }

    if (hasReachedActiveCaseLimit(plan, billingPeriod, usedActiveCases)) {
      setUpgradeDialogMode("active-limit")
      setUpgradeDialogOpen(true)
      return
    }

    setUpgradeDialogOpen(false)
    try {
      await onSubmit()
    } catch (error) {
      if (error instanceof Error && error.message === ACTIVE_CASE_LIMIT_REACHED) {
        setUpgradeDialogMode("active-limit")
        setUpgradeDialogOpen(true)
        return
      }
      throw error
    }
  }

  return (
    <main
      className={cn(
        "flex min-h-svh min-w-0 flex-col overflow-x-hidden bg-background md:min-h-svh md:pb-10 md:pt-6 lg:pt-8",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 sm:px-6 md:px-8">
        {!isStateReady ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <ShieldLoader variant="cases" embedded />
          </div>
        ) : (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <FadeInStagger className="flex flex-col">
            <FadeIn stagger>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Step 1 · What happened?
              </p>
              <h2 className="mt-2 max-w-3xl font-heading text-3xl font-semibold leading-tight text-foreground text-balance sm:text-4xl md:text-5xl">
                Tell us about your situation.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground text-pretty sm:text-base">
                Our AI will score your case strength and lay out the specific laws that apply.
              </p>
            </FadeIn>

            <FadeIn stagger className="mt-6 md:mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Issue Type
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ISSUE_TYPES.map(({ value, iconKey }) => {
                  const Icon = ISSUE_TYPE_ICONS[iconKey]
                  const active = issueType === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIssueType(value)}
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition sm:text-sm",
                        active
                          ? "border-border bg-muted text-foreground shadow-sm ring-1 ring-border/80 font-semibold"
                          : "border-border bg-background text-foreground hover:bg-accent",
                      )}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      {value}
                    </button>
                  )
                })}
              </div>
            </FadeIn>

            <FadeIn stagger className="mt-5 w-full space-y-3 md:mt-6">
              <FloatingLabelInput
                id="new-case-title"
                label="Short title (e.g. 'Unreturned deposit')"
                value={title}
                onValueChange={setTitle}
              />

              <FloatingLabelTextarea
                id="new-case-description"
                label="Describe what happened"
                value={description}
                onValueChange={setDescription}
              />
            </FadeIn>

            <FadeIn stagger className="mt-5 w-full md:mt-6">
              <StatePickerField state={state} onStateChange={setState} />
            </FadeIn>

            <FadeIn stagger className="mt-5 grid w-full gap-3 md:mt-6 lg:grid-cols-2">
              <FloatingLabelInput
                id="new-case-city"
                label="City"
                value={city}
                onValueChange={setCity}
              />
              <FloatingLabelInput
                id="new-case-landlord"
                label="Landlord name"
                value={landlord}
                onValueChange={setLandlord}
              />
            </FadeIn>

            <FadeIn stagger className="mt-3 w-full md:mt-4">
              <FloatingLabelInput
                id="new-case-address"
                label="Property address"
                value={propertyAddress}
                onValueChange={setPropertyAddress}
              />
            </FadeIn>

            {error ? (
              <FadeIn stagger>
                <p className="mt-4 text-sm font-medium text-destructive">{error}</p>
              </FadeIn>
            ) : null}

            <FadeIn stagger>
              <Button
                type="button"
                disabled={!canSubmit}
                onClick={() => void handleSubmitClick()}
                className="mt-6 h-11 w-full rounded-2xl bg-foreground px-6 text-sm font-semibold text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground md:mt-8"
              >
                {isSubmitting ? "Analyzing..." : "Analyze My Case"}
              </Button>
            </FadeIn>
          </FadeInStagger>
        </section>
        )}
      </div>
      <GavelLoaderOverlay show={isSubmitting} variant="case" />
      <PlanUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        eyebrow={upgradeDialogMode === "free" ? "Free plan limit" : "Active case limit"}
        title={
          upgradeDialogMode === "free"
            ? "Upgrade to analyze more cases"
            : "Upgrade to analyze another case"
        }
        description={
          upgradeDialogMode === "free"
            ? "Your free plan includes one case analysis. Choose a plan to analyze another case."
            : `Your current plan allows up to ${activeCaseLimit} active cases at a time. Archive another active case or upgrade on billing to analyze a new one.`
        }
        primaryActionLabel={upgradeDialogMode === "free" ? "View plans" : "Go to billing"}
        primaryActionHref={upgradeDialogMode === "free" ? "/onboarding/plans" : "/billing"}
      />
    </main>
  )
}
