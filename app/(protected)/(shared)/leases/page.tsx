"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LeaseListRow } from "@/components/tenant/leases/lease-list-row"
import { ShieldLoader } from "@/components/shared/shield-loader"
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
  const hasMore = totalPages > 0 && page < totalPages - 1

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
          <div className="flex justify-center py-16">
            <ShieldLoader variant="leases" embedded />
          </div>
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
                <LeaseListRow key={item._id} item={item} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-[14rem] rounded-xl border-cream-border bg-background px-6 text-sm font-semibold disabled:pointer-events-none disabled:opacity-80 sm:min-w-[16rem] sm:text-base"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                {hasMore ? "Load more" : "You have reached the end"}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
