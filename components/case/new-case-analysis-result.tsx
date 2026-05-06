"use client"

import { useEffect, useState } from "react"
import type { z } from "zod"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { caseAnalysisSchema } from "@/convex/cases/aiSchema"
import { Button } from "@/components/ui/button"
import { US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"
import { caseStrengthLabel } from "@/lib/case/caseStrengthLabel"

export type CaseAnalysis = z.infer<typeof caseAnalysisSchema>

export type NewCaseDetailsSnapshot = {
  issueType: string
  title: string
  description: string
  state: string
  city: string
  landlord: string
  propertyAddress: string
}

type Props = {
  details: NewCaseDetailsSnapshot
  aiAnalysis: CaseAnalysis
  onBack: () => void
}

function CaseStrengthDonut({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score))
  const angle = (clamped / 100) * 360

  return (
    <div className="relative flex size-44 shrink-0 items-center justify-center md:size-52">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, var(--primary) 0deg ${angle}deg, var(--border) ${angle}deg 360deg)`,
        }}
        aria-hidden
      />
      <div className="relative flex size-[7.25rem] flex-col items-center justify-center rounded-full bg-background shadow-inner md:size-[8.5rem]">
        <span className="font-heading text-4xl font-semibold leading-none text-ink-warm md:text-5xl">
          {Math.round(clamped)}
        </span>
        <span className="mt-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:text-xs">
          {caseStrengthLabel(clamped).toUpperCase()}
        </span>
      </div>
    </div>
  )
}

function AnalysisSections({ analysis }: { analysis: CaseAnalysis }) {
  const listSection = (title: string, items: string[]) =>
    items.length > 0 ? (
      <section className="space-y-2">
        <h3 className="font-heading text-lg font-semibold text-ink-warm md:text-xl">{title}</h3>
        <ul className="list-inside list-disc space-y-1.5 text-base leading-relaxed text-foreground md:text-lg">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>
    ) : null

  return (
    <div className="space-y-6 text-pretty">
      <div>
        <h3 className="font-heading text-xl font-semibold text-ink-warm md:text-2xl">TenantShield Analysis</h3>
      </div>

      <section className="space-y-2">
        <h4 className="font-heading text-lg font-semibold text-ink-warm md:text-xl">Summary</h4>
        <p className="text-base leading-relaxed text-foreground md:text-lg">{analysis.summary}</p>
      </section>

      <section className="space-y-2">
        <h4 className="font-heading text-lg font-semibold text-ink-warm md:text-xl">Case strength</h4>
        <p className="text-base leading-relaxed text-foreground md:text-lg">{analysis.caseStrengthDescription}</p>
      </section>

      {listSection("Your rights", analysis.yourRights)}
      {listSection("Recommended actions", analysis.recommendedActions)}
      {listSection("Documentation to gather", analysis.documentation)}
      {listSection("Red flags", analysis.redFlags)}
      {listSection("Suggested timeline", analysis.userTimeline)}
    </div>
  )
}

export function NewCaseAnalysisResult({ details, aiAnalysis, onBack }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  const stateName =
    details.state && details.state in US_STATE_NAMES
      ? US_STATE_NAMES[details.state as USStateAbbr]
      : details.state || "—"

  const metaLine = `${stateName.toUpperCase()} · ${details.issueType.toUpperCase()}`

  return (
    <div className="flex w-full flex-1 flex-col">
      <header className="mb-6 flex shrink-0 items-center justify-between md:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 w-11 rounded-full border-border bg-cream-surface-soft p-0 text-foreground"
          aria-label="Back to edit case"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="font-heading text-xl font-semibold text-foreground md:text-2xl">Case Detail</h1>
        <span className="w-11" aria-hidden />
      </header>

      <div className="space-y-6 md:space-y-8 lg:max-w-4xl lg:mx-auto w-full">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{metaLine}</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold leading-tight text-ink-warm text-balance sm:text-4xl md:text-5xl">
            {details.title}
          </h2>
        </div>

        <div className="rounded-3xl border border-cream-border bg-background px-5 py-8 shadow-sm md:px-8 md:py-10">
          <div className="flex flex-col items-center">
            <CaseStrengthDonut score={aiAnalysis.caseStrength} />
            <p className="mt-6 max-w-xs text-center text-sm text-muted-foreground md:text-base">
              Case strength, based on your state&apos;s law.
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">AI analysis</p>
          <div className="mt-3 rounded-3xl border border-cream-border bg-background px-5 py-6 shadow-sm md:px-8 md:py-8">
            <AnalysisSections analysis={aiAnalysis} />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setDetailsOpen((o) => !o)}
          className="h-14 w-full rounded-2xl border-cream-border bg-cream-surface-deep text-lg font-semibold text-ink-warm shadow-sm hover:bg-cream-surface md:text-xl"
          aria-expanded={detailsOpen}
        >
          <span className="flex w-full items-center justify-center gap-2">
            View case details
            {detailsOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </span>
        </Button>

        {detailsOpen ? (
          <div className="rounded-3xl border border-cream-border bg-background px-5 py-6 shadow-sm md:px-8">
            <dl className="space-y-4 text-base md:text-lg">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">Issue type</dt>
                <dd className="mt-1 text-foreground">{details.issueType}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">Title</dt>
                <dd className="mt-1 text-foreground">{details.title}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-foreground">{details.description}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">State</dt>
                <dd className="mt-1 text-foreground">
                  {details.state ? `${stateName} (${details.state})` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">City</dt>
                <dd className="mt-1 text-foreground">{details.city || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">Landlord</dt>
                <dd className="mt-1 text-foreground">{details.landlord || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">
                  Property address
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-foreground">{details.propertyAddress || "—"}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  )
}
