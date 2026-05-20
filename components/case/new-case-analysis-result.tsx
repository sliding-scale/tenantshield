"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import type { z } from "zod"
import type { Id } from "@/convex/_generated/dataModel"
import { ArrowLeft, FileText, MapPin } from "lucide-react"
import { caseAnalysisSchema } from "@/convex/cases/aiSchema"
import { IssueTypeIcon } from "@/components/shared/issue-type-icon"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UpgradeToViewCta } from "@/components/shared/upgrade-to-view-cta"
import { US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"
import { caseStrengthLabel } from "@/lib/case/caseStrengthLabel"
import { shouldBlurFreeCaseAnalysis, type PlanId } from "@/lib/plans/plan-access"
import { cn } from "@/lib/utils"

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
  createdUnderPlan?: PlanId | null
  onBack: () => void
  /** When set, letter generation links include this case and persist caseId on the letter. */
  caseId?: Id<"cases">
  /** When set, hide generate CTA and show link to the existing letter. */
  attachedLetterId?: Id<"letters"> | null
  /** e.g. Archive / Restore — rendered top-right next to the title */
  headerTrailing?: ReactNode
}

function CaseStrengthDonut({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score))
  const angle = (clamped / 100) * 360
  const label = caseStrengthLabel(clamped)

  return (
    <div
      className="relative flex size-36 shrink-0 items-center justify-center sm:size-40 md:size-44"
      role="img"
      aria-label={`Case strength ${Math.round(clamped)}, ${label}`}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, var(--primary) 0deg ${angle}deg, var(--muted) ${angle}deg 360deg)`,
        }}
        aria-hidden
      />
      <div className="relative flex size-[7rem] flex-col items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border sm:size-[7.5rem] md:size-[8.25rem]">
        <span className="font-heading text-4xl font-semibold leading-none text-foreground md:text-[2.75rem]">
          {Math.round(clamped)}
        </span>
        <span
          className={cn(
            "mt-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] md:text-xs",
            clamped >= 60 ? "text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

function CaseDetailRow({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="text-sm leading-relaxed text-foreground md:text-base">{children}</div>
    </div>
  )
}

function AnalysisSections({ analysis }: { analysis: CaseAnalysis }) {
  const listSection = (title: string, items: string[]) =>
    items.length > 0 ? (
      <section className="space-y-2">
        <h3 className="font-heading text-lg font-semibold text-foreground md:text-xl">{title}</h3>
        <ul className="list-inside list-disc space-y-1.5 text-base leading-relaxed text-foreground md:text-lg">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>
    ) : null

  return (
    <div className="space-y-6 px-5 py-6 text-pretty md:px-8 md:py-8">
      <div>
        <h3 className="font-heading text-xl font-semibold text-foreground md:text-2xl">TenantShield Analysis</h3>
      </div>

      <section className="space-y-2">
        <h4 className="font-heading text-lg font-semibold text-foreground md:text-xl">Summary</h4>
        <p className="text-base leading-relaxed text-foreground md:text-lg">{analysis.summary}</p>
      </section>

      <section className="space-y-2">
        <h4 className="font-heading text-lg font-semibold text-foreground md:text-xl">Case strength</h4>
        <p className="text-base leading-relaxed text-foreground md:text-lg">
          {analysis.caseStrengthDescription}
        </p>
      </section>

      {listSection("Your rights", analysis.yourRights)}
      {listSection("Recommended actions", analysis.recommendedActions)}
      {listSection("Documentation to gather", analysis.documentation)}
      {listSection("Red flags", analysis.redFlags)}
      {listSection("Suggested timeline", analysis.userTimeline)}
    </div>
  )
}

function CaseAnalysisLockedPreview({ analysis }: { analysis: CaseAnalysis }) {
  const highlights = [
    analysis.yourRights.length > 0 ? `${analysis.yourRights.length} rights identified` : null,
    analysis.recommendedActions.length > 0
      ? `${analysis.recommendedActions.length} recommended actions`
      : null,
    analysis.documentation.length > 0 ? `${analysis.documentation.length} documents to gather` : null,
    analysis.redFlags.length > 0 ? `${analysis.redFlags.length} red flags` : null,
    analysis.userTimeline.length > 0 ? `${analysis.userTimeline.length} timeline steps` : null,
  ].filter((item): item is string => item !== null)

  const firstAction = analysis.recommendedActions[0]

  return (
    <div
      className="pointer-events-none select-none space-y-4 p-5 blur-[3px] md:space-y-5 md:p-6 lg:p-8"
      aria-hidden
    >
      <section className="space-y-2">
        <h3 className="font-heading text-lg font-semibold text-foreground md:text-xl">
          TenantShield Analysis
        </h3>
        <h4 className="font-heading text-base font-semibold text-foreground md:text-lg">Summary</h4>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground md:line-clamp-4 md:text-base">
          {analysis.summary}
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-heading text-base font-semibold text-foreground md:text-lg">Case strength</h4>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-base">
          {analysis.caseStrengthDescription}
        </p>
      </section>

      {highlights.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {highlights.map((item) => (
            <li
              key={item}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-foreground md:text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {firstAction ? (
        <section className="rounded-xl border border-border bg-accent p-4 md:p-5">
          <h4 className="text-sm font-semibold text-foreground md:text-base">Recommended actions</h4>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{firstAction}</p>
        </section>
      ) : null}

      <section className="space-y-2 pt-1">
        <div className="h-3 w-full rounded-full bg-muted" />
        <div className="h-3 w-[94%] rounded-full bg-muted" />
        <div className="h-3 w-[88%] rounded-full bg-muted" />
      </section>
    </div>
  )
}

export function NewCaseAnalysisResult({
  details,
  aiAnalysis,
  createdUnderPlan,
  onBack,
  caseId,
  attachedLetterId,
  headerTrailing,
}: Props) {
  const blurAnalysis = shouldBlurFreeCaseAnalysis(createdUnderPlan)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  const stateName =
    details.state && details.state in US_STATE_NAMES
      ? US_STATE_NAMES[details.state as USStateAbbr]
      : details.state || "—"

  const metaLine = stateName !== "—" ? stateName.toUpperCase() : "YOUR CASE"
  const descriptionText = details.description?.trim() || ""
  const descriptionWords = descriptionText ? descriptionText.split(/\s+/) : []
  const isDescriptionLong = descriptionWords.length > 10
  const collapsedDescription = isDescriptionLong ? `${descriptionWords.slice(0, 10).join(" ")}...` : descriptionText
  const displayedDescription = showFullDescription ? descriptionText : collapsedDescription
  const hasDescription = Boolean(descriptionText)
  const hasLandlord = Boolean(details.landlord?.trim())
  const hasPropertyAddress = Boolean(details.propertyAddress?.trim())
  const hasCity = Boolean(details.city?.trim())

  const letterHref = {
    pathname: "/write-letters",
    query: {
      ...(caseId ? { caseId } : {}),
      issueType: details.issueType,
      issue: details.description || details.title,
      state: details.state || "",
      landlord: details.landlord || "",
      propertyAddress: details.propertyAddress || "",
    },
  } as const

  return (
    <div className="flex w-full flex-1 flex-col">
      <header className="mb-6 grid grid-cols-[2.75rem_1fr_auto] items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 w-11 rounded-full border-border bg-accent p-0 text-foreground"
          aria-label="Back to cases"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-center font-heading text-xl font-semibold text-foreground sm:text-2xl">
          Case Detail
        </h1>
        <div className="flex min-h-11 min-w-0 justify-end">{headerTrailing ?? <span className="w-11 shrink-0" aria-hidden />}</div>
      </header>

      <div className="w-full space-y-6 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:space-y-8 lg:mx-auto lg:max-w-4xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{metaLine}</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold leading-tight text-foreground text-balance sm:text-4xl md:text-5xl">
            {details.title}
          </h2>
        </div>

        <Card className="gap-0 overflow-hidden rounded-3xl border border-border py-0 shadow-none ring-0">
          <div className="grid md:grid-cols-[minmax(0,15rem)_1fr] md:divide-x md:divide-border">
            <div className="flex flex-col items-center border-b border-border bg-muted/25 px-5 py-7 sm:py-8 md:border-b-0 md:py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Case strength
              </p>
              <div className="mt-5">
                <CaseStrengthDonut score={aiAnalysis.caseStrength} />
              </div>
              <p className="mt-4 max-w-[12rem] text-center text-sm leading-relaxed text-muted-foreground">
                {details.state
                  ? `Scored against ${stateName} tenant law.`
                  : "Scored against your state's tenant law."}
              </p>
            </div>

            <div className="space-y-5 px-5 py-6 md:px-7 md:py-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Case details
              </p>

              {details.issueType ? (
                <CaseDetailRow label="Issue type">
                  <span className="inline-flex items-center gap-2.5">
                    <IssueTypeIcon
                      issueType={details.issueType}
                      className="size-7 bg-muted text-foreground"
                      iconClassName="size-3.5 text-muted-foreground"
                    />
                    <span className="font-semibold">{details.issueType}</span>
                  </span>
                </CaseDetailRow>
              ) : null}

              {hasDescription ? (
                <CaseDetailRow label="What happened">
                  <p className="whitespace-pre-wrap">{displayedDescription}</p>
                  {isDescriptionLong ? (
                    <button
                      type="button"
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="mt-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {showFullDescription ? "See less" : "See more"}
                    </button>
                  ) : null}
                </CaseDetailRow>
              ) : null}

              {details.state ? (
                <CaseDetailRow label="State">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    {stateName}
                  </span>
                </CaseDetailRow>
              ) : null}

              {hasCity ? <CaseDetailRow label="City">{details.city}</CaseDetailRow> : null}
              {hasLandlord ? <CaseDetailRow label="Landlord">{details.landlord}</CaseDetailRow> : null}
              {hasPropertyAddress ? (
                <CaseDetailRow label="Property address">
                  <p className="whitespace-pre-wrap">{details.propertyAddress}</p>
                </CaseDetailRow>
              ) : null}
            </div>
          </div>
        </Card>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">AI analysis</p>
          {blurAnalysis ? (
            <div className="relative mt-3 min-h-64 overflow-hidden rounded-3xl border border-border bg-background shadow-sm md:min-h-72 lg:min-h-80">
              <CaseAnalysisLockedPreview analysis={aiAnalysis} />
              <UpgradeToViewCta
                eyebrow="Case analysis"
                title="Upgrade to view this analysis"
                description="See the full TenantShield breakdown, recommended actions, and next steps on a paid plan."
                actionLabel="Upgrade to view it"
              />
            </div>
          ) : (
            <div className="mt-3 overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
              <AnalysisSections analysis={aiAnalysis} />
            </div>
          )}
        </div>

      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-border bg-cream-page/95 px-4 pb-[max(1rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-3 backdrop-blur-md sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <div className="mx-auto w-full lg:max-w-4xl">
          {attachedLetterId ? (
            <Button
              asChild
              variant="outline"
              className="h-14 w-full rounded-2xl border-cream-border bg-cream-surface-deep px-6 text-lg font-semibold text-ink-warm hover:bg-cream-surface md:text-xl"
            >
              <Link href={`/letters/${attachedLetterId}`} className="inline-flex items-center justify-center gap-2">
                <FileText className="size-5 shrink-0" aria-hidden />
                Attached letter
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-14 w-full rounded-2xl bg-surface-strong px-6 text-lg font-semibold text-white hover:bg-surface-strong-hover md:text-xl"
            >
              <Link href={letterHref}>Generate a letter</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
