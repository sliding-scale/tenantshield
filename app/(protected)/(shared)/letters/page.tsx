"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { FileText, Plus } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { ListRowPill } from "@/components/shared/list-row-pill"
import { Button } from "@/components/ui/button"

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
    <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">Letters</h1>
            <p className="mt-2 text-ink-warm-muted">
              Your generated demand letters. Open, copy, print, and deliver as needed.
            </p>
          </div>
          <Button
            size="sm"
            className="h-10 w-full gap-1.5 rounded-xl border-0 bg-surface-strong px-4 text-sm font-semibold text-white shadow-sm hover:bg-surface-strong-hover sm:w-auto"
            asChild
          >
            <Link href="/write-letters">
              <Plus className="size-4" aria-hidden />
              Create letter
            </Link>
          </Button>
        </header>

        {data === undefined ? (
          <p className="text-muted-foreground">Loading letters...</p>
        ) : letters.length === 0 ? (
          <div className="rounded-3xl border border-cream-border bg-cream-surface p-8 text-center">
            <p className="font-heading text-2xl text-ink-warm">No letters yet</p>
            <p className="mt-2 text-ink-warm-muted">
              Generate a letter from Write Letters to see it listed here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:gap-5">
              {letters.map((item) => (
                <Link
                  key={item._id}
                  href={`/letters/${item._id}`}
                  className="block rounded-3xl border border-cream-border bg-cream-surface p-4 transition hover:bg-cream-surface-soft sm:p-5 md:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {item.inputData.state} · {item.inputData.letterType}
                    </p>
                    <ListRowPill tone="muted">
                      Recipient · {item.inputData.landlordName || "Landlord"}
                    </ListRowPill>
                  </div>
                  <h2 className="mt-1.5 line-clamp-2 break-words text-balance font-heading text-xl font-semibold leading-snug text-ink-warm sm:text-2xl">
                    {item.letterData?.header?.subjectLine || "Demand Letter"}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-warm-muted">
                    {item.preview}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="size-4" />
                    View letter
                  </div>
                </Link>
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
