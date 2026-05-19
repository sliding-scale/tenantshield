"use client"

import { useMemo, useState, type ComponentType, type MutableRefObject } from "react"
import { useQuery } from "convex/react"
import {
  AlertTriangle,
  CircleHelp,
  FileText,
  Gavel,
  Scale,
  Search,
  Shield,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api"
import { GavelLoaderOverlay } from "@/components/shared/gavel-loader"
import { PlanUpgradeDialog } from "@/components/tenant/free-plan-upgrade-dialog"
import { Button } from "@/components/ui/button"
import {
  ISSUE_TYPES,
  type IssueTypeIconKey,
} from "@/lib/constants/issue-types"
import { US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"
import {
  ACTIVE_CASE_LIMIT_REACHED,
  hasReachedActiveCaseLimit,
  resolvePlanId,
  shouldPromptFreePlanUpgrade,
} from "@/lib/plans/plan-access"
import { getActiveCaseLimit } from "@/lib/plans/plans"

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

type NewCaseFormProps = {
  issueType: string
  setIssueType: (value: string) => void
  title: string
  setTitle: (value: string) => void
  description: string
  setDescription: (value: string) => void
  state: string
  setState: (value: string) => void
  stateSearch: string
  setStateSearch: (value: string) => void
  chipsToShow: USStateAbbr[]
  selectionHiddenBySearch: boolean
  filteredStatesCount: number
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
  onClose: () => void
  stateChipRefs: MutableRefObject<Map<string, HTMLButtonElement>>
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
  stateSearch,
  setStateSearch,
  chipsToShow,
  selectionHiddenBySearch,
  filteredStatesCount,
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
  onClose,
  stateChipRefs,
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

  const selectedStateName = useMemo(
    () => (state ? US_STATE_NAMES[state as USStateAbbr] : ""),
    [state],
  )

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
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <header className="mb-5 flex shrink-0 items-center justify-between md:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 w-11 rounded-full border-border bg-cream-surface-soft p-0 text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </header>

        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-cream-border bg-cream-surface p-5 shadow-sm sm:p-7 md:rounded-3xl md:p-10 lg:p-12 xl:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">
            Step 1 · What happened?
          </p>
          <h2 className="mt-3 max-w-5xl font-heading text-4xl font-semibold leading-[0.95] text-ink-warm text-balance sm:text-5xl md:text-6xl lg:text-7xl xl:max-w-6xl">
            Tell us about your situation.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-ink-warm-muted text-pretty sm:text-xl lg:max-w-4xl lg:text-2xl">
            Our AI will score your case strength and lay out the specific laws that apply.
          </p>

          <div className="mt-8 md:mt-10 lg:mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted md:text-sm">
              Issue Type
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5 md:gap-3 lg:max-w-5xl">
              {ISSUE_TYPES.map(({ value, iconKey }) => {
                const Icon = ISSUE_TYPE_ICONS[iconKey]
                const active = issueType === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setIssueType(value)}
                    className={[
                      "inline-flex min-h-11 items-center gap-3 rounded-full border px-4 py-2.5 text-base font-medium transition md:text-lg",
                      active
                        ? "border-cream-border bg-cream-surface-deep text-ink-warm shadow-sm ring-1 ring-cream-border/80 font-semibold"
                        : "border-border bg-background text-foreground hover:bg-accent",
                    ].join(" ")}
                  >
                    <Icon className="size-4" />
                    {value}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 space-y-4 md:mt-8 lg:grid lg:max-w-6xl lg:grid-cols-2 lg:gap-6 lg:space-y-0">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short title (e.g. 'Unreturned deposit')"
              className="h-14 w-full rounded-3xl border border-border bg-background px-5 text-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-16 md:text-xl lg:col-span-2"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened"
              rows={5}
              className="min-h-[140px] w-full rounded-3xl border border-border bg-background px-5 py-4 text-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-[180px] md:text-xl lg:col-span-2 lg:min-h-[220px]"
            />
          </div>

          <div className="mt-6 md:mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted md:text-sm">State</p>
            <div className="relative mt-3 w-full">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                placeholder="Search by name or code…"
                autoComplete="off"
                className="h-10 w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11 md:text-base"
                aria-label="Search states"
              />
            </div>
            {selectionHiddenBySearch ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected: {selectedStateName} ({state}) — clear search to browse all, or pick below.
              </p>
            ) : null}
            <div className="relative mt-3 w-full min-w-0">
              <div
                className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden px-1 pb-2 [scrollbar-width:thin] touch-pan-x"
                role="listbox"
                aria-label="Select state"
              >
                {chipsToShow.map((abbr) => {
                  const active = state === abbr
                  return (
                    <button
                      key={abbr}
                      type="button"
                      role="option"
                      aria-selected={active}
                      ref={(el) => {
                        if (el) stateChipRefs.current.set(abbr, el)
                        else stateChipRefs.current.delete(abbr)
                      }}
                      onClick={() => setState(abbr)}
                      title={US_STATE_NAMES[abbr]}
                      className={[
                        "inline-flex h-12 shrink-0 snap-start items-center justify-center rounded-2xl border px-[1.1rem] text-base transition md:min-w-[4.25rem] md:px-5 md:text-lg",
                        active
                          ? "border-cream-border bg-cream-surface-deep text-ink-warm shadow-sm ring-1 ring-cream-border/80 font-semibold"
                          : "border-transparent bg-background font-medium text-foreground hover:bg-accent",
                      ].join(" ")}
                    >
                      {abbr}
                    </button>
                  )
                })}
              </div>
            </div>
            {stateSearch.trim() !== "" && filteredStatesCount === 0 ? (
              <p className="mt-2 text-sm font-medium text-muted-foreground">No states match your search.</p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:mt-8 lg:max-w-6xl lg:grid-cols-2 lg:gap-6">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (optional)"
              className="h-14 w-full rounded-3xl border border-border bg-background px-5 text-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-16 md:text-xl"
            />
            <input
              value={landlord}
              onChange={(e) => setLandlord(e.target.value)}
              placeholder="Landlord name (optional)"
              className="h-14 w-full rounded-3xl border border-border bg-background px-5 text-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-16 md:text-xl"
            />
            <input
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Property address (optional)"
              className="h-14 w-full rounded-3xl border border-border bg-background px-5 text-lg text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-16 md:text-xl lg:col-span-2"
            />
          </div>

          {error ? <p className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}

          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleSubmitClick()}
            className="mt-8 h-14 mx-auto w-full rounded-2xl bg-surface-strong px-6 text-lg font-semibold text-white hover:bg-surface-strong-hover disabled:bg-muted disabled:text-muted-foreground md:mt-10 md:max-w-md md:text-xl lg:max-w-sm"
          >
            {isSubmitting ? "Analyzing..." : "Analyze My Case"}
          </Button>
        </section>
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

