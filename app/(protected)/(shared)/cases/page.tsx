"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { FileText, Plus } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { caseStrengthPillTone, ListRowPill } from "@/components/shared/list-row-pill"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { caseStrengthLabel } from "@/lib/case/caseStrengthLabel"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

export default function CasesPage() {
  const [bucket, setBucket] = useState<"active" | "archived">("active")
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [bucket])

  const data = useQuery(api.cases.queries.listCasesPaged, { status: bucket, page })

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (page > data.totalPages - 1) setPage(data.totalPages - 1)
  }, [data, page])

  const cases = data?.items ?? []
  const totalPages = data?.totalPages ?? 0
  const hasMore = totalPages > 0 && page < totalPages - 1

  return (
    <main
      className={cn(
        "min-h-svh bg-background px-4 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">Cases</h1>
            <p className="mt-2 text-muted-foreground">
              {bucket === "active"
                ? "Your active cases. Use Archive below a card or on the case detail screen when you’re done with it."
                : "Archived cases stay here for reference. Restore from the row above a card or on the case detail page."}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Button
              size="sm"
              className="h-10 w-full gap-1.5 rounded-xl border-0 bg-foreground px-4 text-sm font-semibold text-white shadow-sm hover:bg-foreground/90 sm:w-auto"
              asChild
            >
              <Link href="/newcase">
                <Plus className="size-4" aria-hidden />
                Create case
              </Link>
            </Button>
            <div
              className="flex shrink-0 w-full rounded-xl border border-border bg-card px-2 py-1.5 shadow-sm sm:w-auto"
              role="tablist"
              aria-label="Case list filter"
            >
              <button
                type="button"
                role="tab"
                aria-selected={bucket === "active"}
                onClick={() => setBucket("active")}
                className={[
                  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none",
                  bucket === "active"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                Active
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={bucket === "archived"}
                onClick={() => setBucket("archived")}
                className={[
                  "flex-1 rounded-lg px-4 text-sm font-semibold transition sm:flex-none",
                  bucket === "archived"
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                Archived
              </button>
            </div>
          </div>
        </header>

        {data === undefined ? (
          <div className="flex justify-center py-16">
            <ShieldLoader variant="cases" embedded />
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="font-heading text-2xl text-foreground">
              {bucket === "active" ? "No active cases" : "No archived cases"}
            </p>
            <p className="mt-2 text-muted-foreground">
              {bucket === "active"
                ? "Create a case from New Case to see it listed here."
                : "Archive a case from the list or detail page to see it here."}
            </p>
            {bucket === "active" ? null : (
              <Button
                type="button"
                variant="outline"
                className="mt-6 rounded-xl border-border bg-background"
                onClick={() => setBucket("active")}
              >
                Back to active cases
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:gap-5">
              {cases.map((item) => (
                <div key={item._id} className="space-y-2">
                  {/* <div className="flex justify-end px-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busyId === item._id}
                      onClick={() => void toggleArchiveForCase(item._id)}
                      className="h-9 rounded-lg px-3 text-sm font-semibold text-foreground hover:bg-muted hover:text-foreground md:h-10 md:px-4 md:text-base"
                    >
                      {busyId === item._id
                        ? "…"
                        : bucket === "active"
                          ? "Archive case"
                          : "Restore to active"}
                    </Button>
                  </div> */}
                  <Link
                    href={`/cases/${item._id}`}
                    className="block rounded-3xl border border-border bg-card p-4 transition hover:bg-accent sm:p-5 md:p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {item.inputData.state} · {item.inputData.issueType}
                      </p>
                      <ListRowPill tone={caseStrengthPillTone(item.aiAnalysis.caseStrength)}>
                        {Math.round(item.aiAnalysis.caseStrength)} ·{" "}
                        {caseStrengthLabel(item.aiAnalysis.caseStrength)}
                      </ListRowPill>
                    </div>
                    <h2 className="mt-1.5 truncate font-heading text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
                      {item.inputData.shortTitle}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {item.aiAnalysis.summary}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground md:mt-4">
                      <FileText className="size-4" />
                      View AI response
                    </div>
                  </Link>
                </div>
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
