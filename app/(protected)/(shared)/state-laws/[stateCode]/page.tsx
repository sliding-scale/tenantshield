"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"
import type { StateTenantLaw } from "@/convex/stateLaws/aiSchema"

function buildStateSummary(lawDetails: StateTenantLaw) {
  const { headlineMetrics, depositReturnTimeline } = lawDetails
  const parts: string[] = [
    `Deposits capped at ${headlineMetrics.depositCap.toLowerCase()}`,
  ]

  if (depositReturnTimeline.trim()) {
    const timeline = depositReturnTimeline.trim().replace(/^returned /i, "")
    parts.push(`Must be returned ${timeline.charAt(0).toLowerCase()}${timeline.slice(1)}`)
  }

  const grace = headlineMetrics.gracePeriod.trim()
  if (grace && grace.toLowerCase() !== "none") {
    parts.push(`${grace} grace period on rent`)
  }

  return `${parts.join(". ")}.`
}

function buildRepairSummary(repair: StateTenantLaw["repairAndHabitability"]) {
  let text = repair.landlordObligation.trim()
  if (repair.legalCitation?.trim()) {
    text += ` (${repair.legalCitation.trim()})`
  }
  if (repair.repairAndDeductAvailable) {
    text += ". Tenant may use 'repair and deduct' if issues are not fixed."
  }
  return text
}

export default function StateLawDetailPage({
  params,
}: {
  params: Promise<{ stateCode: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const stateCode = resolvedParams.stateCode.toUpperCase()

  const stateLaw = useQuery(api.stateLaws.queries.getStateLawByCode, {
    stateCode,
  })

  if (stateLaw === undefined) {
    return <ShieldLoader variant="laws" fullPage />
  }

  if (stateLaw === null) {
    return (
      <main
        className={cn(
          "flex min-h-svh flex-col items-center justify-center bg-background px-4 md:min-h-svh",
          MOBILE_TAB_BAR_PAGE_SHELL,
        )}
      >
        <p className="font-heading text-2xl font-medium text-foreground">State not found</p>
        <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">
          Go back
        </button>
      </main>
    )
  }

  const { lawDetails, stateName } = stateLaw
  const { headlineMetrics, repairAndHabitability, evictionNotice } = lawDetails

  const metricCards = [
    { label: "Deposit Cap", value: headlineMetrics.depositCap },
    { label: "Grace Period", value: headlineMetrics.gracePeriod },
    { label: "Notice To Quit", value: headlineMetrics.noticeToQuit },
  ] as const

  return (
    <main
      className={cn(
        "min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 md:mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-11 w-11 rounded-full border-border bg-card p-0 text-foreground"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <p className="text-center text-base font-semibold text-foreground">{stateCode}</p>
          <span className="w-11 shrink-0" aria-hidden />
        </header>

        <section className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Tenant Rights · {stateCode}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {stateName}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {buildStateSummary(lawDetails)}
          </p>
        </section>

        <div className="mb-10 grid grid-cols-3 gap-2 sm:gap-3 md:mb-12 md:gap-4">
          {metricCards.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center rounded-2xl bg-foreground px-2 py-5 text-center sm:px-4 sm:py-6 md:rounded-3xl md:py-8"
            >
              <p className="font-heading text-lg font-semibold leading-none text-primary sm:text-xl md:text-2xl">
                {value}
              </p>
              <p className="mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-background/80 sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-8 md:space-y-10">
          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
              Repair & Habitability
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
              {buildRepairSummary(repairAndHabitability)}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
              Eviction Notice
            </h2>
            <p className="mt-3 space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg">
              <span className="block">
                <span className="font-semibold text-foreground">Nonpayment:</span>{" "}
                {evictionNotice.nonpayment}
              </span>
              <span className="block">
                <span className="font-semibold text-foreground">Lease violation:</span>{" "}
                {evictionNotice.otherBreach}
              </span>
            </p>
          </section>
        </div>

        <Link
          href={`/newcase?state=${encodeURIComponent(stateCode)}`}
          className="group mt-10 flex items-center gap-4 rounded-2xl bg-foreground p-5 transition hover:bg-foreground/95 sm:gap-5 sm:p-6 md:mt-12 md:rounded-3xl md:p-8"
        >
          <Briefcase className="size-6 shrink-0 text-primary sm:size-7" aria-hidden />
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-semibold text-background sm:text-xl">
              Have a dispute in {stateName}?
            </h3>
            <p className="mt-1 text-sm text-background/70 sm:text-base">
              Get an AI case-strength score using {stateCode}-specific law.
            </p>
          </div>
          <ChevronRight
            className="size-5 shrink-0 text-background transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </main>
  )
}
