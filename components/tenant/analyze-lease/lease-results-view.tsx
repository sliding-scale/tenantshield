"use client"

import { useEffect } from "react"
import {
  AlertTriangle,
  CheckCircle,
  FileQuestion,
  HelpCircle,
  ShieldCheck,
} from "lucide-react"
import { UpgradeToViewCta } from "@/components/shared/upgrade-to-view-cta"
import { shouldBlurFreeLeaseAnalysis, type PlanId } from "@/lib/plans/plan-access"
import { cn } from "@/lib/utils"

export type LeaseAnalysis = {
  leaseReview: string
  documentSummary: string
  redFlags: Array<{ quote: string; problem: string }>
  missingClauses: Array<{ clauseName: string; explanation: string }>
  tenantFriendlyClauses: Array<{ quote: string; explanation: string }>
  questionsToAsk: string[]
  overallRecommendation: string
}

export function LeaseResultsView({
  analysis,
  headerTrailing,
  createdUnderPlan,
  flatHeader = false,
  hideEyebrow = false,
}: {
  analysis: LeaseAnalysis
  headerTrailing?: React.ReactNode
  createdUnderPlan?: PlanId | null
  flatHeader?: boolean
  hideEyebrow?: boolean
}) {
  const blurAnalysis = shouldBlurFreeLeaseAnalysis(createdUnderPlan)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  return (
    <div className="flex flex-col gap-6 pb-6">
      <section
        className={cn(
          !flatHeader &&
            "rounded-2xl border border-border bg-card p-6 shadow-sm md:rounded-3xl md:p-10",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {!hideEyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">
                Lease Analysis Complete
              </p>
            ) : null}
            <h2
              className={
                hideEyebrow
                  ? "font-heading text-3xl font-semibold text-foreground md:text-4xl"
                  : "mt-2 font-heading text-3xl font-semibold text-foreground md:text-4xl"
              }
            >
              {analysis.leaseReview}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {analysis.documentSummary}
            </p>
          </div>
          {headerTrailing ? <div className="shrink-0">{headerTrailing}</div> : null}
        </div>
      </section>

      {blurAnalysis ? (
        <div className="relative min-h-96 overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:min-h-[28rem] md:rounded-3xl lg:min-h-[32rem]">
          <LeaseAnalysisLockedPreview analysis={analysis} />
          <UpgradeToViewCta
            eyebrow="Lease analysis"
            title="Upgrade to view this analysis"
            description="See the full TenantShield lease breakdown, red flags, missing clauses, and questions to ask on a paid plan."
            actionLabel="Upgrade to view it"
          />
        </div>
      ) : (
        <LeaseAnalysisSections analysis={analysis} />
      )}
    </div>
  )
}

function LeaseAnalysisLockedPreview({ analysis }: { analysis: LeaseAnalysis }) {
  const highlights = [
    analysis.redFlags.length > 0 ? `${analysis.redFlags.length} red flags` : null,
    analysis.missingClauses.length > 0 ? `${analysis.missingClauses.length} missing clauses` : null,
    analysis.tenantFriendlyClauses.length > 0
      ? `${analysis.tenantFriendlyClauses.length} tenant-friendly clauses`
      : null,
    analysis.questionsToAsk.length > 0 ? `${analysis.questionsToAsk.length} questions to ask` : null,
  ].filter((item): item is string => item !== null)

  const firstRedFlag = analysis.redFlags[0]
  const firstMissing = analysis.missingClauses[0]

  return (
    <div className="pointer-events-none select-none space-y-5 p-6 blur-[3px] md:space-y-6 md:p-8 lg:p-10" aria-hidden>
      <section>
        <div className="flex items-center gap-2">
          <CheckCircle className="size-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground md:text-xl">
            Overall Recommendation
          </h3>
        </div>
        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground md:line-clamp-5 md:text-base">
          {analysis.overallRecommendation}
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

      {firstRedFlag ? (
        <section className="rounded-xl border border-border bg-accent p-4 md:p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <h4 className="text-sm font-semibold text-foreground md:text-base">
              Red Flags ({analysis.redFlags.length})
            </h4>
          </div>
          <p className="mt-3 line-clamp-2 border-l-2 border-destructive pl-3 text-sm italic text-muted-foreground">
            &ldquo;{firstRedFlag.quote}&rdquo;
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-foreground">{firstRedFlag.problem}</p>
        </section>
      ) : null}

      {firstMissing ? (
        <section className="rounded-xl border border-border bg-accent p-4 md:p-5">
          <div className="flex items-center gap-2">
            <FileQuestion className="size-4 text-warning" />
            <h4 className="text-sm font-semibold text-foreground md:text-base">
              Missing Clauses ({analysis.missingClauses.length})
            </h4>
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">{firstMissing.clauseName}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{firstMissing.explanation}</p>
        </section>
      ) : null}

      <section className="space-y-2.5 pt-1">
        <div className="h-3 w-full rounded-full bg-muted" />
        <div className="h-3 w-[94%] rounded-full bg-muted" />
        <div className="h-3 w-[88%] rounded-full bg-muted" />
        <div className="h-3 w-[76%] rounded-full bg-muted" />
        <div className="h-3 w-[84%] rounded-full bg-muted" />
      </section>
    </div>
  )
}

function LeaseAnalysisSections({ analysis }: { analysis: LeaseAnalysis }) {
  const verdict = analysis.overallRecommendation.split(" ")[0]?.toUpperCase() ?? ""
  const verdictColor =
    verdict === "GOOD"
      ? "text-primary"
      : verdict === "NEGOTIATE"
        ? "text-warning"
        : "text-destructive"

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:rounded-3xl md:p-10">
        <div className="flex items-center gap-2">
          <CheckCircle className={`size-5 shrink-0 ${verdictColor}`} />
          <h3 className="text-lg font-semibold text-foreground md:text-xl">
            Overall Recommendation
          </h3>
        </div>
        <p className="mt-3 w-full text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
          {analysis.overallRecommendation}
        </p>
      </section>

      {analysis.redFlags.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:rounded-3xl md:p-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground md:text-xl">
              Red Flags ({analysis.redFlags.length})
            </h3>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {analysis.redFlags.map((rf, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-accent p-4"
              >
                <blockquote className="border-l-2 border-destructive pl-3 text-sm italic text-muted-foreground">
                  &ldquo;{rf.quote}&rdquo;
                </blockquote>
                <p className="mt-2 text-sm text-foreground">{rf.problem}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {analysis.missingClauses.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:rounded-3xl md:p-10">
          <div className="flex items-center gap-2">
            <FileQuestion className="size-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground md:text-xl">
              Missing Clauses ({analysis.missingClauses.length})
            </h3>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {analysis.missingClauses.map((mc, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-accent p-4"
              >
                <p className="text-sm font-semibold text-foreground">
                  {mc.clauseName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mc.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.tenantFriendlyClauses.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:rounded-3xl md:p-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground md:text-xl">
              Tenant-Friendly Clauses ({analysis.tenantFriendlyClauses.length})
            </h3>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {analysis.tenantFriendlyClauses.map((tf, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-accent p-4"
              >
                <blockquote className="border-l-2 border-primary pl-3 text-sm italic text-muted-foreground">
                  &ldquo;{tf.quote}&rdquo;
                </blockquote>
                <p className="mt-2 text-sm text-foreground">{tf.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.questionsToAsk.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:rounded-3xl md:p-10">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground md:text-xl">
              Questions to Ask Your Landlord
            </h3>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {analysis.questionsToAsk.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
