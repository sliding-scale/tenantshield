"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { api } from "@/convex/_generated/api"
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
  const canPrev = totalPages > 0 && page > 0
  const canNext = totalPages > 0 && page < totalPages - 1

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 md:mb-8">
          <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">Letters</h1>
          <p className="mt-2 text-ink-warm-muted">
            Your generated demand letters. Open, copy, print, and deliver as needed.
          </p>
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {item.inputData.state} · {item.inputData.letterType}
                      </p>
                      <h2 className="mt-1.5 line-clamp-2 break-words text-balance font-heading text-xl font-semibold leading-snug text-ink-warm sm:text-2xl">
                        {item.letterData?.header?.subjectLine || "Demand Letter"}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-warm-muted">
                        {item.preview}
                      </p>
                    </div>
                    <div className="shrink-0 self-start rounded-2xl border border-cream-border bg-background px-3 py-2 text-right sm:max-w-[9.5rem] sm:px-3.5 sm:py-2.5">
                      <p className="truncate font-heading text-base font-semibold text-ink-warm sm:text-lg">
                        {item.inputData.landlordName || "Landlord"}
                      </p>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground sm:text-xs">
                        Recipient
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="size-4" />
                    View letter
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
