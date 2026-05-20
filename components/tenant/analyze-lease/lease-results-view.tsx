"use client"

import {
  AlertTriangle,
  CheckCircle,
  FileQuestion,
  HelpCircle,
  ShieldCheck,
} from "lucide-react"
import { UpgradeToViewCta } from "@/components/shared/upgrade-to-view-cta"
import { shouldBlurFreeLeaseAnalysis, type PlanId } from "@/lib/plans/plan-access"

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
}: {
  analysis: LeaseAnalysis
  headerTrailing?: React.ReactNode
  createdUnderPlan?: PlanId | null
}) {
  const blurAnalysis = shouldBlurFreeLeaseAnalysis(createdUnderPlan)

  return (
    <div className="flex flex-col gap-6 pb-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:rounded-3xl md:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">
              Lease Analysis Complete
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground md:text-4xl">
              {analysis.leaseReview}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {analysis.documentSummary}
            </p>
          </div>
          {headerTrailing ? <div className="shrink-0">{headerTrailing}</div> : null}
        </div>
      </section>

      <div className={blurAnalysis ? "relative overflow-hidden rounded-3xl" : undefined}>
        {blurAnalysis && (
          <div className="pointer-events-none select-none blur-sm" aria-hidden>
            <LeaseAnalysisSections analysis={analysis} />
          </div>
        )}
        {!blurAnalysis && <LeaseAnalysisSections analysis={analysis} />}
        {blurAnalysis && (
          <UpgradeToViewCta
            eyebrow="Lease analysis"
            title="Upgrade to view this analysis"
            description="See the full TenantShield lease breakdown, red flags, missing clauses, and questions to ask on a paid plan."
            actionLabel="Upgrade to view it"
          />
        )}
      </div>
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
        <div className="flex items-start gap-3">
          <CheckCircle className={`mt-0.5 size-6 shrink-0 ${verdictColor}`} />
          <div>
            <h3 className="text-lg font-semibold text-foreground md:text-xl">
              Overall Recommendation
            </h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {analysis.overallRecommendation}
            </p>
          </div>
        </div>
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
