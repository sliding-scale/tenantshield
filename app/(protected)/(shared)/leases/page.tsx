"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { ChevronLeft, ChevronRight, FileSearch } from "lucide-react"
import { LeaseVerdictTag } from "@/components/shared/list-row-pill"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"

export default function LeasesPage() {
  const [page, setPage] = useState(0)
  const data = useQuery(api.lease.queries.listLeasesPaged, { page })

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages - 1) setPage(data.totalPages - 1)
  }, [data, page])

  const leases = data?.items ?? []
  const totalPages = data?.totalPages ?? 0
  const canPrev = totalPages > 0 && page > 0
  const canNext = totalPages > 0 && page < totalPages - 1
  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 md:mb-8">
          <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">Leases</h1>
          <p className="mt-2 text-ink-warm-muted">
            Your analyzed leases. Open one to revisit red flags, missing clauses, and questions to ask.
          </p>
        </header>

        {data === undefined ? (
          <p className="text-muted-foreground">Loading leases...</p>
        ) : leases.length === 0 ? (
          <div className="rounded-3xl border border-cream-border bg-cream-surface p-8 text-center">
            <p className="font-heading text-2xl text-ink-warm">No leases yet</p>
            <p className="mt-2 text-ink-warm-muted">
              Upload a lease from Analyze Lease to see it listed here.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-6 rounded-xl border-cream-border bg-background"
            >
              <Link href="/analyze-lease">Analyze a lease</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:gap-5">
              {leases.map((item) => (
                <Link
                  key={item._id}
                  href={`/leases/${item._id}`}
                  className="block rounded-3xl border border-cream-border bg-cream-surface p-4 transition hover:bg-cream-surface-soft sm:p-5 md:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {item.state} · Lease Analysis
                    </p>
                    <LeaseVerdictTag verdict={item.verdict} />
                  </div>
                  <h2 className="mt-1.5 line-clamp-2 break-words text-balance font-heading text-xl font-semibold leading-snug text-ink-warm sm:text-2xl">
                    {item.leaseReview || "Lease Review"}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-warm-muted">
                    {item.documentSummary}
                  </p>
                  {item.issuesCount > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-ink-warm-muted">
                      {item.redFlagsCount > 0 ? (
                        <span>{item.redFlagsCount} red flag{item.redFlagsCount === 1 ? "" : "s"}</span>
                      ) : null}
                      {item.missingClausesCount > 0 ? (
                        <span>{item.missingClausesCount} missing clause{item.missingClausesCount === 1 ? "" : "s"}</span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileSearch className="size-4" />
                    View analysis
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              {totalPages > 1 ? (
                <p className="mr-auto text-sm text-muted-foreground md:text-base">
                  Page {page + 1} of {totalPages}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-cream-border bg-background"
                  aria-label="Previous page"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl border-cream-border bg-background"
                  aria-label="Next page"
                  disabled={!canNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
