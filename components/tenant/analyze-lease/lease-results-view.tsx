"use client"

import {
  AlertTriangle,
  CheckCircle,
  FileQuestion,
  HelpCircle,
  ShieldCheck,
} from "lucide-react"

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
}: {
  analysis: LeaseAnalysis
  headerTrailing?: React.ReactNode
}) {
  const verdict = analysis.overallRecommendation.split(" ")[0]?.toUpperCase() ?? ""
  const verdictColor =
    verdict === "GOOD"
      ? "text-primary"
      : verdict === "NEGOTIATE"
        ? "text-warning"
        : "text-destructive"

  return (
    <div className="flex flex-col gap-6 pb-6">
      <section className="rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-sm md:rounded-3xl md:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">
              Lease Analysis Complete
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-ink-warm md:text-4xl">
              {analysis.leaseReview}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-warm-muted md:text-lg">
              {analysis.documentSummary}
            </p>
          </div>
          {headerTrailing ? <div className="shrink-0">{headerTrailing}</div> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-sm md:rounded-3xl md:p-10">
        <div className="flex items-start gap-3">
          <CheckCircle className={`mt-0.5 size-6 shrink-0 ${verdictColor}`} />
          <div>
            <h3 className="text-lg font-semibold text-ink-warm md:text-xl">
              Overall Recommendation
            </h3>
            <p className="mt-2 text-base leading-relaxed text-ink-warm-muted">
              {analysis.overallRecommendation}
            </p>
          </div>
        </div>
      </section>

      {analysis.redFlags.length > 0 && (
        <section className="rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-sm md:rounded-3xl md:p-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            <h3 className="text-lg font-semibold text-ink-warm md:text-xl">
              Red Flags ({analysis.redFlags.length})
            </h3>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {analysis.redFlags.map((rf, i) => (
              <div
                key={i}
                className="rounded-xl border border-cream-border bg-cream-surface-soft p-4"
              >
                <blockquote className="border-l-2 border-destructive pl-3 text-sm italic text-ink-warm-muted">
                  &ldquo;{rf.quote}&rdquo;
                </blockquote>
                <p className="mt-2 text-sm text-ink-warm">{rf.problem}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {analysis.missingClauses.length > 0 && (
        <section className="rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-sm md:rounded-3xl md:p-10">
          <div className="flex items-center gap-2">
            <FileQuestion className="size-5 text-warning" />
            <h3 className="text-lg font-semibold text-ink-warm md:text-xl">
              Missing Clauses ({analysis.missingClauses.length})
            </h3>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {analysis.missingClauses.map((mc, i) => (
              <div
                key={i}
                className="rounded-xl border border-cream-border bg-cream-surface-soft p-4"
              >
                <p className="text-sm font-semibold text-ink-warm">
                  {mc.clauseName}
                </p>
                <p className="mt-1 text-sm text-ink-warm-muted">
                  {mc.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.tenantFriendlyClauses.length > 0 && (
        <section className="rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-sm md:rounded-3xl md:p-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h3 className="text-lg font-semibold text-ink-warm md:text-xl">
              Tenant-Friendly Clauses ({analysis.tenantFriendlyClauses.length})
            </h3>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {analysis.tenantFriendlyClauses.map((tf, i) => (
              <div
                key={i}
                className="rounded-xl border border-cream-border bg-cream-surface-soft p-4"
              >
                <blockquote className="border-l-2 border-primary pl-3 text-sm italic text-ink-warm-muted">
                  &ldquo;{tf.quote}&rdquo;
                </blockquote>
                <p className="mt-2 text-sm text-ink-warm">{tf.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.questionsToAsk.length > 0 && (
        <section className="rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-sm md:rounded-3xl md:p-10">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-ink-warm-muted" />
            <h3 className="text-lg font-semibold text-ink-warm md:text-xl">
              Questions to Ask Your Landlord
            </h3>
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {analysis.questionsToAsk.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-ink-warm"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-cream-surface-deep text-xs font-semibold text-ink-warm-muted">
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
