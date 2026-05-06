"use client"

import Link from "next/link"
import { useQuery } from "convex/react"
import { FileText } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { caseStrengthLabel } from "@/lib/case/caseStrengthLabel"

export default function CasesPage() {
  const cases = useQuery(api.cases.queries.listForCurrentUser)

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 md:mb-8">
          <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">Cases</h1>
          <p className="mt-2 text-ink-warm-muted">Review your analyzed cases and open full AI responses.</p>
        </header>

        {cases === undefined ? (
          <p className="text-muted-foreground">Loading cases...</p>
        ) : cases.length === 0 ? (
          <div className="rounded-3xl border border-cream-border bg-cream-surface p-8 text-center">
            <p className="font-heading text-2xl text-ink-warm">No cases yet</p>
            <p className="mt-2 text-ink-warm-muted">Create a case from New Case to see it listed here.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-5">
            {cases.map((item) => (
              <Link
                key={item._id}
                href={`/cases/${item._id}`}
                className="block rounded-3xl border border-cream-border bg-cream-surface p-5 transition hover:bg-cream-surface-soft md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {item.inputData.state} · {item.inputData.issueType}
                    </p>
                    <h2 className="mt-2 truncate font-heading text-2xl font-semibold text-ink-warm md:text-3xl">
                      {item.inputData.shortTitle}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-warm-muted md:text-base">
                      {item.aiAnalysis.summary}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-cream-border bg-background px-4 py-3 text-right">
                    <p className="font-heading text-3xl text-ink-warm">{Math.round(item.aiAnalysis.caseStrength)}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {caseStrengthLabel(item.aiAnalysis.caseStrength)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="size-4" />
                  View AI response
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
