"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { Plus, ChevronRight } from "lucide-react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { CaseStrengthScore } from "@/components/case/case-strength-score"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

type CaseDoc = Doc<"cases">

export default function CasesMain() {
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
        "min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <FadeIn>
          <header className="mb-6 md:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Disputes
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
                Your Cases
              </h1>
              <Button
                variant="cta"
                size="icon-lg"
                className="size-11 shrink-0 rounded-full md:size-12"
                asChild
              >
                <Link href="/newcase" aria-label="Create new case">
                  <Plus className="size-5 md:size-6" aria-hidden />
                </Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                {bucket === "active"
                  ? "Active disputes with AI strength scores. Archive a case when you are done with it."
                  : "Archived cases stay here for reference. Restore any case to active when needed."}
              </p>

              <Tabs
                value={bucket}
                onValueChange={(value) => setBucket(value as "active" | "archived")}
                className="w-full sm:w-auto"
              >
                <TabsList className="h-11 w-full rounded-xl bg-card p-1 ring-1 ring-foreground/10 sm:w-auto">
                  <TabsTrigger value="active" className="flex-1 rounded-lg px-4 sm:flex-none">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="flex-1 rounded-lg px-4 sm:flex-none">
                    Archived
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </header>
        </FadeIn>

          {data === undefined ? (
            <div className="flex justify-center py-16">
              <ShieldLoader variant="cases" embedded />
            </div>
          ) : cases.length === 0 ? (
            <FadeIn>
              <Card className="gap-0 rounded-3xl border border-border py-0 text-center shadow-none ring-0">
                <div className="px-6 py-10 md:px-8 md:py-12">
                  <p className="font-heading text-2xl font-semibold text-foreground">
                    {bucket === "active" ? "No active cases" : "No archived cases"}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    {bucket === "active"
                      ? "Tap + to create a case and get an AI strength score."
                      : "Archive a case from the list or detail page to see it here."}
                  </p>
                  {bucket === "archived" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-6 rounded-xl"
                      onClick={() => setBucket("active")}
                    >
                      Back to active cases
                    </Button>
                  ) : null}
                </div>
              </Card>
            </FadeIn>
          ) : (
            <>
              <FadeInStagger className="flex flex-col gap-3 md:gap-4">
                {cases.map((item) => (
                  <FadeIn key={item._id} stagger>
                    <CaseRow item={item} />
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

function CaseRow({ item }: { item: CaseDoc }) {
  return (
    <Link href={`/cases/${item._id}`} className="group block">
      <Card className="gap-0 rounded-3xl border border-border py-0 shadow-none ring-0 transition hover:bg-accent">
        <div className="flex flex-col gap-2 px-4 py-4 sm:px-5 sm:py-5 md:gap-3 md:px-6 md:py-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {item.inputData.state} · {item.inputData.issueType}
              </p>
              <h2 className="mt-1.5 font-heading text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
                {item.inputData.shortTitle}
              </h2>
            </div>
            <CaseStrengthScore score={item.aiAnalysis.caseStrength} />
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {item.aiAnalysis.summary}
          </p>
          <ChevronRight
            className="size-5 shrink-0 self-end text-muted-foreground transition group-hover:text-foreground sm:size-6"
            aria-hidden
          />
        </div>
      </Card>
    </Link>
  )
}
