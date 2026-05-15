"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { Briefcase, ChevronLeft, ChevronRight, Scale } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { ShieldLoader } from "@/components/shared/shield-loader"

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
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-cream-page px-4 md:min-h-[calc(100vh-4rem)]">
        <p className="font-heading text-2xl font-medium text-ink-warm">State not found</p>
        <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">
          Go back
        </button>
      </main>
    )
  }

  const { lawDetails, stateName } = stateLaw
  const { headlineMetrics, depositReturnTimeline, repairAndHabitability, evictionNotice } = lawDetails

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-ink-warm-muted transition-colors hover:text-ink-warm"
          >
            <ChevronLeft className="size-4" />
            Back to States
          </button>
        </div>

        <header className="mb-8 md:mb-12">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Tenant Rights · {stateCode}
            </p>
          </div>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-ink-warm md:text-5xl lg:text-6xl">
            {stateName}
          </h1>
          
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-warm-muted md:text-xl">
            Security deposit capped at {headlineMetrics.depositCap.toLowerCase()};
            must be returned {depositReturnTimeline.toLowerCase()}.
            Notice to quit is {headlineMetrics.noticeToQuit.toLowerCase()}.
          </p>
        </header>

        {/* Headline Metrics Cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mb-14 md:gap-6">
          <div className="rounded-3xl border border-cream-border bg-cream-surface p-6 shadow-sm md:p-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">
              Deposit Cap
            </h3>
            <p className="mt-3 font-heading text-2xl font-semibold leading-tight text-ink-warm md:text-3xl">
              {headlineMetrics.depositCap}
            </p>
          </div>
          <div className="rounded-3xl border border-cream-border bg-cream-surface p-6 shadow-sm md:p-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">
              Grace Period
            </h3>
            <p className="mt-3 font-heading text-2xl font-semibold leading-tight text-ink-warm md:text-3xl">
              {headlineMetrics.gracePeriod}
            </p>
          </div>
          <div className="rounded-3xl border border-cream-border bg-cream-surface p-6 shadow-sm md:p-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">
              Notice To Quit
            </h3>
            <p className="mt-3 font-heading text-2xl font-semibold leading-tight text-ink-warm md:text-3xl">
              {headlineMetrics.noticeToQuit}
            </p>
          </div>
        </div>

        {/* Detail Sections */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <section className="rounded-3xl border border-cream-border bg-cream-surface p-6 md:p-8">
            <h2 className="font-heading text-2xl font-semibold text-ink-warm md:text-3xl">
              Repair & Habitability
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-warm-muted md:text-lg">
              {repairAndHabitability.landlordObligation}
              {repairAndHabitability.legalCitation && ` (${repairAndHabitability.legalCitation}).`}
              {repairAndHabitability.repairAndDeductAvailable && " Tenant may use 'repair and deduct' remedy if issues are not fixed."}
            </p>
          </section>

          <section className="rounded-3xl border border-cream-border bg-cream-surface p-6 md:p-8">
            <h2 className="font-heading text-2xl font-semibold text-ink-warm md:text-3xl">
              Eviction Notice
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-warm-muted md:text-lg">
              <span className="font-semibold text-ink-warm">Nonpayment:</span> {evictionNotice.nonpayment}<br/>
              <span className="mt-2 block font-semibold text-ink-warm">Lease violation:</span> {evictionNotice.otherBreach}
            </p>
          </section>
        </div>

        {/* CTA Banner */}
        <Link
          href="/newcase"
          className="group mt-12 flex flex-col justify-between gap-6 rounded-3xl border border-cream-border bg-ink-warm p-6 transition hover:bg-ink-warm/95 sm:flex-row sm:items-center sm:p-8 md:mt-16 md:p-10"
        >
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-cream-page text-ink-warm md:size-16">
              <Briefcase className="size-6 md:size-8" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-cream-page md:text-2xl">
                Have a dispute in {stateName}?
              </h3>
              <p className="mt-1 text-sm text-cream-page/80 md:text-base">
                Get an AI case-strength score using {stateCode}-specific law.
              </p>
            </div>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream-page/10 text-cream-page transition-colors group-hover:bg-cream-page/20">
            <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </main>
  )
}
