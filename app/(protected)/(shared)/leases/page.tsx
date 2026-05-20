"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { Plus } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { LeaseListRow } from "@/components/tenant/leases/lease-list-row"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

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
    <main
      className={cn(
        "min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <FadeIn>
          <header className="mb-6 md:mb-8">
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
                Leases
              </h1>
              <Button
                variant="cta"
                size="icon-lg"
                className="size-11 shrink-0 rounded-full md:size-12"
                asChild
              >
                <Link href="/analyze-lease" aria-label="Analyze lease">
                  <Plus className="size-5 md:size-6" aria-hidden />
                </Link>
              </Button>
            </div>
            <p className="mt-2 text-muted-foreground">
              Your analyzed leases. Open one to revisit red flags, missing clauses, and questions to
              ask.
            </p>
          </header>
        </FadeIn>

        {data === undefined ? (
          <div className="flex justify-center py-16">
            <ShieldLoader variant="leases" embedded />
          </div>
        ) : leases.length === 0 ? (
          <FadeIn>
            <Card className="gap-0 rounded-3xl border border-border py-0 text-center shadow-none ring-0">
              <div className="px-6 py-10 md:px-8 md:py-12">
                <p className="font-heading text-2xl font-semibold text-foreground">No leases yet</p>
                <p className="mt-2 text-muted-foreground">
                  Upload a lease from Analyze Lease to see it listed here.
                </p>
                <Button asChild variant="outline" className="mt-6 rounded-xl">
                  <Link href="/analyze-lease">Analyze a lease</Link>
                </Button>
              </div>
            </Card>
          </FadeIn>
        ) : (
          <>
            <FadeInStagger className="flex flex-col gap-3 md:gap-4">
              {leases.map((item) => (
                <FadeIn key={item._id} stagger>
                  <LeaseListRow item={item} />
                </FadeIn>
              ))}
            </FadeInStagger>

            {hasMore ? (
              <FadeIn>
                <div className="mt-8 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 min-w-56 rounded-xl px-6 text-sm font-semibold sm:text-base"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load more
                  </Button>
                </div>
              </FadeIn>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}
