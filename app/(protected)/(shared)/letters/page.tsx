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
        <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">Letters</h1>
            <p className="mt-2 text-muted-foreground">
              Your generated demand letters. Open, copy, print, and deliver as needed.
            </p>
          </div>
          <Button
            size="sm"
            className="h-10 w-full gap-1.5 rounded-xl border-0 bg-foreground px-4 text-sm font-semibold text-white shadow-sm hover:bg-foreground/90 sm:w-auto"
            asChild
          >
            <Link href="/write-letters">
              <Plus className="size-4" aria-hidden />
              Create letter
            </Link>
          </Button>
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

            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-[14rem] rounded-xl border-border bg-background px-6 text-sm font-semibold disabled:pointer-events-none disabled:opacity-80 sm:min-w-[16rem] sm:text-base"
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
