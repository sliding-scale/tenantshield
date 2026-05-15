"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import type { z } from "zod"
import type { Id } from "@/convex/_generated/dataModel"
import { ArrowLeft, FileText } from "lucide-react"
import { caseAnalysisSchema } from "@/convex/cases/aiSchema"
import { Button } from "@/components/ui/button"
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

function AnalysisSections({
  analysis,
  blurContent,
}: {
  analysis: CaseAnalysis
  blurContent: boolean
}) {
  const blurredBodyClass = blurContent ? "blur-sm select-none" : undefined
  const listSection = (title: string, items: string[]) =>
    items.length > 0 ? (
      <section className="space-y-2">
        <h3 className="font-heading text-lg font-semibold text-ink-warm md:text-xl">{title}</h3>
        <ul
          className={cn(
            "list-inside list-disc space-y-1.5 text-base leading-relaxed text-foreground md:text-lg",
            blurredBodyClass,
          )}
        >
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
        <p
          className={cn(
            "text-base leading-relaxed text-foreground md:text-lg",
            blurredBodyClass,
          )}
        >
          {analysis.summary}
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="font-heading text-lg font-semibold text-ink-warm md:text-xl">Case strength</h4>
        <p
          className={cn(
            "text-base leading-relaxed text-foreground md:text-lg",
            blurredBodyClass,
          )}
        >
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

  const metaLine = `${stateName.toUpperCase()} · ${details.issueType.toUpperCase()}`
  const descriptionText = details.description?.trim() || ""
  const descriptionWords = descriptionText ? descriptionText.split(/\s+/) : []
  const isDescriptionLong = descriptionWords.length > 10
  const collapsedDescription = isDescriptionLong ? `${descriptionWords.slice(0, 10).join(" ")}...` : descriptionText || "—"
  const displayedDescription = showFullDescription ? descriptionText || "—" : collapsedDescription

  return (
    <div className="flex w-full flex-1 flex-col">
      <header className="mb-6 grid grid-cols-[2.75rem_1fr_auto] items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 w-11 rounded-full border-border bg-cream-surface-soft p-0 text-foreground"
          aria-label="Back to cases"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-center font-heading text-xl font-semibold text-foreground sm:text-2xl">
          Case Detail
        </h1>
        <div className="flex min-h-11 min-w-0 justify-end">{headerTrailing ?? <span className="w-11 shrink-0" aria-hidden />}</div>
      </header>

      <div className="space-y-6 md:space-y-8 lg:max-w-4xl lg:mx-auto w-full">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{metaLine}</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold leading-tight text-ink-warm text-balance sm:text-4xl md:text-5xl">
            {details.title}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-cream-border bg-background px-5 py-8 shadow-sm md:px-8 md:py-10">
            <div className="flex flex-col items-center">
              <CaseStrengthDonut score={aiAnalysis.caseStrength} />
              <p className="mt-6 max-w-xs text-center text-sm text-muted-foreground md:text-base">
                Case strength, based on your state&apos;s law.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-cream-border bg-background px-5 py-6 shadow-sm md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">Case details</p>
            <dl className="mt-4 space-y-3 text-sm md:text-base">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">Issue type</dt>
                <dd className="mt-1 text-foreground">{details.issueType || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-foreground">{displayedDescription}</dd>
                {isDescriptionLong ? (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription((prev) => !prev)}
                    className="mt-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {showFullDescription ? "See less" : "See more"}
                  </button>
                ) : null}
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">State</dt>
                <dd className="mt-1 text-foreground">
                  {details.state ? `${stateName} (${details.state})` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">Landlord</dt>
                <dd className="mt-1 text-foreground">{details.landlord || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-warm-muted">
                  Property address
                </dt>
                <dd className="mt-1 line-clamp-2 whitespace-pre-wrap text-foreground">{details.propertyAddress || "—"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">AI analysis</p>
          <div
            className={cn(
              "mt-3 overflow-hidden rounded-3xl border border-cream-border bg-background px-5 py-6 shadow-sm md:px-8 md:py-8",
              blurAnalysis && "relative min-h-[20rem]",
            )}
          >
            <AnalysisSections analysis={aiAnalysis} blurContent={blurAnalysis} />
            {blurAnalysis ? (
              <UpgradeToViewCta
                eyebrow="Case analysis"
                title="Upgrade to view this analysis"
                description="See the full TenantShield breakdown, recommended actions, and next steps on a paid plan."
                actionLabel="Upgrade to view it"
              />
            ) : null}
          </div>
        </div>

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
            <Link
              href={{
                pathname: "/write-letters",
                query: {
                  ...(caseId ? { caseId } : {}),
                  issueType: details.issueType,
                  issue: details.description || details.title,
                  state: details.state || "",
                  landlord: details.landlord || "",
                  propertyAddress: details.propertyAddress || "",
                },
              }}
            >
              Generate a letter
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
