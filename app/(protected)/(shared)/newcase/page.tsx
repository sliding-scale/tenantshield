"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAction } from "convex/react"
import {
  AlertTriangle,
  CircleHelp,
  FileText,
  Gavel,
  Search,
  Shield,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  NewCaseAnalysisResult,
  type CaseAnalysis,
  type NewCaseDetailsSnapshot,
} from "@/components/case/new-case-analysis-result"
import { filterUSStates, US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"

const ISSUE_TYPES = [
  { label: "Security Deposit", Icon: Gavel },
  { label: "Repairs / Habitability", Icon: Wrench },
  { label: "Eviction Notice", Icon: AlertTriangle },
  { label: "Rent Increase", Icon: TrendingUp },
  { label: "Lease Dispute", Icon: FileText },
  { label: "Landlord Harassment", Icon: Shield },
  { label: "Discrimination", Icon: AlertTriangle },
  { label: "Other", Icon: CircleHelp },
] as const

export default function NewCasePage() {
  const router = useRouter()
  const analyzeCase = useAction(api.cases.actions.analyzeNewCase)
  const stateChipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const [issueType, setIssueType] = useState<string>(ISSUE_TYPES[0].label)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [state, setState] = useState<string>("")
  const [stateSearch, setStateSearch] = useState("")
  const [city, setCity] = useState("")
  const [landlord, setLandlord] = useState("")
  const [propertyAddress, setPropertyAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
    caseId: Id<"cases">
    aiAnalysis: CaseAnalysis
    details: NewCaseDetailsSnapshot
  } | null>(null)

  const filteredStates = useMemo(() => filterUSStates(stateSearch), [stateSearch])

  const chipsToShow = useMemo(() => {
    if (!state) return filteredStates
    const sel = state as USStateAbbr
    if (filteredStates.includes(sel)) return filteredStates
    return [sel, ...filteredStates]
  }, [filteredStates, state])

  useEffect(() => {
    const el = stateChipRefs.current.get(state)
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [state])

  const selectionHiddenBySearch =
    Boolean(state) &&
    stateSearch.trim().length > 0 &&
    !filteredStates.includes(state as USStateAbbr)

  const canSubmit = Boolean(issueType && title.trim() && description.trim() && state && !isSubmitting)

  const onSubmit = async () => {
    if (!canSubmit) return
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await analyzeCase({
        issueType,
        shortTitle: title.trim(),
        description: description.trim(),
        state,
        city: city.trim() || undefined,
        landlordName: landlord.trim() || undefined,
        propertyAddress: propertyAddress.trim() || undefined,
      })
      console.log("analyzeNewCase response", result)
      const details: NewCaseDetailsSnapshot = {
        issueType,
        title: title.trim(),
        description: description.trim(),
        state,
        city: city.trim(),
        landlord: landlord.trim(),
        propertyAddress: propertyAddress.trim(),
      }
      setAnalysisResult({
        caseId: result.caseId,
        aiAnalysis: result.aiAnalysis,
        details,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to analyze case"
      setError(message)
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (analysisResult) {
    return (
      <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
        <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
          <NewCaseAnalysisResult
            details={analysisResult.details}
            aiAnalysis={analysisResult.aiAnalysis}
            onBack={() => setAnalysisResult(null)}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <header className="mb-5 flex shrink-0 items-center justify-between md:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
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
              {ISSUE_TYPES.map(({ label, Icon }) => {
                const active = issueType === label
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setIssueType(label)}
                    className={[
                      "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-base font-medium transition md:text-lg",
                      active
                        ? "border-cream-border bg-cream-surface-deep text-ink-warm shadow-sm ring-1 ring-cream-border/80 font-semibold"
                        : "border-border bg-background text-foreground hover:bg-accent",
                    ].join(" ")}
                  >
                    <Icon className="size-4" />
                    {label}
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
                Selected: {US_STATE_NAMES[state as USStateAbbr]} ({state}) — clear search to browse all, or pick below.
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
            {stateSearch.trim() !== "" && filteredStates.length === 0 ? (
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

          {error ? (
            <p className="mt-4 text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => void onSubmit()}
            className="mt-8 h-14 w-full rounded-2xl bg-surface-strong px-6 text-lg font-semibold text-white hover:bg-surface-strong-hover disabled:bg-muted disabled:text-muted-foreground md:mt-10 md:max-w-md md:text-xl lg:max-w-sm"
          >
            {isSubmitting ? "Analyzing..." : "Analyze My Case"}
          </Button>
        </section>
      </div>
    </main>
  )
}
