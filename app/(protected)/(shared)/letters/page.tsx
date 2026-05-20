"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { Plus } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { LetterListRow } from "@/components/tenant/letters/letter-list-row"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

export default function LettersPage() {
  const [page, setPage] = useState(0)
  const data = useQuery(api.letters.queries.listLettersPaged, { page })

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages - 1) setPage(data.totalPages - 1)
  }, [data, page])

  const letters = data?.items ?? []
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
        <header className="mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">Letters</h1>
            <Button
              variant="cta"
              size="icon-lg"
              className="size-11 shrink-0 rounded-full md:size-12"
              asChild
            >
              <Link href="/write-letters" aria-label="Create letter">
                <Plus className="size-5 md:size-6" aria-hidden />
              </Link>
            </Button>
          </div>
          <p className="mt-2 text-muted-foreground">
            Your generated demand letters. Open, copy, print, and deliver as needed.
          </p>
        </header>

        {data === undefined ? (
          <div className="flex justify-center py-16">
            <ShieldLoader variant="letters" embedded />
          </div>
        ) : letters.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="font-heading text-2xl text-foreground">No letters yet</p>
            <p className="mt-2 text-muted-foreground">
              Generate a letter from Write Letters to see it listed here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:gap-5">
              {letters.map((item) => (
                <LetterListRow key={item._id} item={item} />
              ))}
            </div>

            {hasMore ? (
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
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}
