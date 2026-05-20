"use client"

import { useMemo, useState, type ComponentType, type ReactNode } from "react"
import { useQuery } from "convex/react"
import {
  AlertTriangle,
  CircleHelp,
  FileText,
  Gavel,
  MapPin,
  Pencil,
  Scale,
  Shield,
  TrendingUp,
  Wrench,
} from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { GavelLoaderOverlay } from "@/components/shared/gavel-loader"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/tenant/new-case/floating-label-field"
import { PlanUpgradeDialog } from "@/components/tenant/free-plan-upgrade-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ISSUE_TYPES,
  type IssueTypeIconKey,
  type IssueTypeValue,
} from "@/lib/constants/issue-types"
import { US_STATES, US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import {
  hasReachedLetterLimit,
  resolvePlanId,
  shouldPromptFreePlanUpgrade,
} from "@/lib/plans/plan-access"
import { getLetterLimit } from "@/lib/plans/plans"
import { cn } from "@/lib/utils"

const ISSUE_TYPE_ICONS: Record<IssueTypeIconKey, ComponentType<{ className?: string }>> = {
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

type NewLetterFormProps = {
  letterType: IssueTypeValue
  setLetterType: (value: IssueTypeValue) => void
  state: string
  setState: (value: string) => void
  fullName: string
  setFullName: (value: string) => void
  landlordName: string
  setLandlordName: (value: string) => void
  propertyAddress: string
  setPropertyAddress: (value: string) => void
  senderAddress: string
  setSenderAddress: (value: string) => void
  landlordAddress: string
  setLandlordAddress: (value: string) => void
  description: string
  setDescription: (value: string) => void
  amountAtStake: string
  setAmountAtStake: (value: string) => void
  deadlineDays: string
  setDeadlineDays: (value: string) => void
  error: string | null
  success: string | null
  canSubmit: boolean
  isSubmitting: boolean
  onSubmit: () => void | Promise<void>
  isStateReady?: boolean
  topBanner?: ReactNode
}

export function NewLetterForm({
  letterType,
  setLetterType,
  state,
  setState,
  fullName,
  setFullName,
  landlordName,
  setLandlordName,
  propertyAddress,
  setPropertyAddress,
  senderAddress,
  setSenderAddress,
  landlordAddress,
  setLandlordAddress,
  description,
  setDescription,
  amountAtStake,
  setAmountAtStake,
  deadlineDays,
  setDeadlineDays,
  error,
  success,
  canSubmit,
  isSubmitting,
  onSubmit,
  isStateReady = true,
  topBanner,
}: NewLetterFormProps) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [upgradeDialogMode, setUpgradeDialogMode] = useState<"free" | "limit">("free")
  const [isEditingState, setIsEditingState] = useState(false)
  const { convexUser } = useCurrentUser()
  const counts = useQuery(api.dashboard.queries.countsForCurrentUser, {})
  const planUsage = useQuery(api.planUsage.queries.current, {})
  const plan = resolvePlanId(planUsage?.plan ?? convexUser?.plan)
  const billingPeriod = planUsage?.planType ?? "monthly"
  const generatedLetterCount = counts?.letters ?? 0
  const usedLetters = planUsage?.usedLetters ?? 0
  const letterLimit = getLetterLimit(plan, billingPeriod)

  const selectedStateName = useMemo(
    () => (state ? US_STATE_NAMES[state as USStateAbbr] : ""),
    [state],
  )

  const showStatePicker = !state || isEditingState

  const handleStateChange = (value: string) => {
    setState(value)
    setIsEditingState(false)
  }

  const handleSubmitClick = async () => {
    if (shouldPromptFreePlanUpgrade(plan, generatedLetterCount)) {
      setUpgradeDialogMode("free")
      setUpgradeDialogOpen(true)
      return
    }

    if (hasReachedLetterLimit(plan, billingPeriod, usedLetters)) {
      setUpgradeDialogMode("limit")
      setUpgradeDialogOpen(true)
      return
    }

    setUpgradeDialogOpen(false)
    await onSubmit()
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
              {topBanner ? <FadeIn stagger>{topBanner}</FadeIn> : null}

              <FadeIn stagger>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Demand letter
                </p>
                <h2 className="mt-2 max-w-3xl font-heading text-3xl font-semibold leading-tight text-foreground text-balance sm:text-4xl md:text-5xl">
                  Turn your issue into a legal-grade letter.
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground text-pretty sm:text-base">
                  Our AI drafts a state-specific demand letter with statute citations, timelines, and
                  consequences.
                </p>
              </FadeIn>

              <FadeIn stagger className="mt-6 md:mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Issue type
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ISSUE_TYPES.map((type) => {
                    const active = letterType === type.value
                    const Icon = ISSUE_TYPE_ICONS[type.iconKey]
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setLetterType(type.value)}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition sm:text-sm",
                          active
                            ? "border-border bg-muted text-foreground shadow-sm ring-1 ring-border/80 font-semibold"
                            : "border-border bg-background text-foreground hover:bg-accent",
                        )}
                      >
                        <Icon className="size-3.5 shrink-0" />
                        {type.value}
                      </button>
                    )
                  })}
                </div>
              </FadeIn>

              <FadeIn stagger className="mt-5 w-full md:mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  State
                </p>
                {showStatePicker ? (
                  <Select value={state || undefined} onValueChange={handleStateChange}>
                    <SelectTrigger className={cn(fieldClass, "mt-2")}>
                      <SelectValue placeholder="Select your state…" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {US_STATES.map((abbr) => (
                        <SelectItem key={abbr} value={abbr}>
                          {US_STATE_NAMES[abbr]} ({abbr})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-foreground">
                        <MapPin className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {selectedStateName}
                        </p>
                        <p className="text-xs text-muted-foreground">{state}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 px-2 text-xs font-semibold text-primary"
                      onClick={() => setIsEditingState(true)}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Change
                    </Button>
                  </div>
                )}
              </FadeIn>

              <FadeIn stagger className="mt-5 grid w-full gap-3 md:mt-6 lg:grid-cols-2">
                <FloatingLabelInput
                  id="letter-full-name"
                  label="Your full name"
                  value={fullName}
                  onValueChange={setFullName}
                />
                <FloatingLabelInput
                  id="letter-landlord-name"
                  label="Landlord's name"
                  value={landlordName}
                  onValueChange={setLandlordName}
                />
              </FadeIn>

              <FadeIn stagger className="mt-3 w-full md:mt-4">
                <FloatingLabelInput
                  id="letter-property-address"
                  label="Rental property address"
                  value={propertyAddress}
                  onValueChange={setPropertyAddress}
                />
              </FadeIn>

              <FadeIn stagger className="mt-3 w-full md:mt-4">
                <FloatingLabelTextarea
                  id="letter-sender-address"
                  label="Your mailing address (appears exactly on the letter)"
                  value={senderAddress}
                  onValueChange={setSenderAddress}
                  rows={3}
                />
              </FadeIn>

              <FadeIn stagger className="mt-3 w-full md:mt-4">
                <FloatingLabelTextarea
                  id="letter-landlord-address"
                  label="Landlord mailing address (appears exactly on the letter)"
                  value={landlordAddress}
                  onValueChange={setLandlordAddress}
                  rows={3}
                />
              </FadeIn>

              <FadeIn stagger className="mt-3 w-full md:mt-4">
                <FloatingLabelTextarea
                  id="letter-description"
                  label="Describe the specific issue / what you want"
                  value={description}
                  onValueChange={setDescription}
                />
              </FadeIn>

              <FadeIn stagger className="mt-3 grid w-full gap-3 md:mt-4 lg:grid-cols-2">
                <FloatingLabelInput
                  id="letter-amount"
                  label="Amount at stake ($)"
                  value={amountAtStake}
                  onValueChange={setAmountAtStake}
                />
                <FloatingLabelInput
                  id="letter-deadline"
                  label="Response deadline (days)"
                  value={deadlineDays}
                  onValueChange={setDeadlineDays}
                  inputMode="numeric"
                />
              </FadeIn>

              {error ? (
                <FadeIn stagger>
                  <p className="mt-4 text-sm font-medium text-destructive">{error}</p>
                </FadeIn>
              ) : null}
              {success ? (
                <FadeIn stagger>
                  <p className="mt-4 text-sm font-medium text-foreground">{success}</p>
                </FadeIn>
              ) : null}

              <FadeIn stagger>
                <Button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => void handleSubmitClick()}
                  className="mt-6 h-11 w-full rounded-2xl bg-foreground px-6 text-sm font-semibold text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground md:mt-8"
                >
                  {isSubmitting ? "Generating..." : "Generate Letter"}
                </Button>
              </FadeIn>
            </FadeInStagger>
          </section>
        )}
      </div>
      <GavelLoaderOverlay show={isSubmitting} variant="letter" />
      <PlanUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        eyebrow={upgradeDialogMode === "free" ? "Free plan limit" : "Letter limit"}
        title={
          upgradeDialogMode === "free"
            ? "Upgrade to generate more letters"
            : "Upgrade to write another letter"
        }
        description={
          upgradeDialogMode === "free"
            ? "Your free plan includes one letter preview. Choose a plan to write another letter."
            : `Your current plan allows up to ${letterLimit} letters per ${billingPeriod === "yearly" ? "year" : "month"}. Upgrade on billing to write a new one.`
        }
        primaryActionLabel={upgradeDialogMode === "free" ? "View plans" : "Go to billing"}
        primaryActionHref={upgradeDialogMode === "free" ? "/onboarding/plans" : "/billing"}
      />
    </main>
  )
}
