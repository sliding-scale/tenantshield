"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { ChevronLeft } from "lucide-react"
import { ShieldLoader } from "@/components/shared/shield-loader"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  LeaseResultsView,
  type LeaseAnalysis,
} from "@/components/tenant/analyze-lease/lease-results-view"
import { LeasePdfSidebarCard } from "@/components/tenant/leases/lease-pdf-access"

export default function LeaseDetailPage() {
  const params = useParams<{ leaseId: string }>()
  const router = useRouter()
  const leaseId = (params?.leaseId ?? "") as Id<"leases">
  const lease = useQuery(
    api.lease.queries.getLeaseForCurrentUser,
    leaseId ? { leaseId } : "skip",
  )

  if (!params?.leaseId) {
    return (
      <main className="min-h-svh bg-background px-4 py-6 md:min-h-svh md:px-8 md:py-10">
        <p className="text-muted-foreground">Invalid lease id.</p>
      </main>
    )
  }

  if (lease === undefined) {
    return (
      <main className="min-h-svh bg-background px-4 py-6 md:min-h-svh md:px-8 md:py-10">
        <ShieldLoader variant="lease" fullPage />
      </main>
    )
  }

  if (!lease) {
    return (
      <main className="min-h-svh bg-background px-4 py-6 md:min-h-svh md:px-8 md:py-10">
        <p className="text-muted-foreground">Lease not found.</p>
      </main>
    )
  }

  if (!lease.aiAnalysis) {
    return (
      <main className="min-h-svh bg-background px-4 py-6 md:min-h-svh md:px-8 md:py-10">
        <p className="text-muted-foreground">
          This lease has not finished analyzing yet. Please check back shortly.
        </p>
      </main>
    )
  }

  const pdfDisplayName = lease.pdfFileName
  const hasPdf = Boolean(lease.pdfFile)

  return (
    <main className="flex min-h-svh flex-col bg-background pb-28 pt-5 md:min-h-svh md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:flex-row lg:px-14 xl:px-16">
        <div className="flex-1">
          <div className="mb-4 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 sm:gap-3 md:mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/leases")}
              className="h-11 w-11 rounded-full border-border bg-accent p-0 text-foreground"
              aria-label="Back to leases"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
              Lease Analysis
            </p>
            <span className="size-11 shrink-0" aria-hidden />
          </div>
          {hasPdf ? (
            <div className="mb-5 lg:hidden">
              <LeasePdfSidebarCard
                leaseId={leaseId}
                pdfUrl={lease.pdfUrl}
                pdfDisplayName={pdfDisplayName}
              />
            </div>
          ) : null}
          <LeaseResultsView
            analysis={lease.aiAnalysis as LeaseAnalysis}
            createdUnderPlan={lease.createdUnderPlan}
            flatHeader
            hideEyebrow
          />
        </div>

        {hasPdf ? (
          <aside className="hidden w-72 shrink-0 self-start lg:block">
            <div className="sticky top-[calc(var(--navbar-height)+1.5rem)]">
              <LeasePdfSidebarCard
                leaseId={leaseId}
                pdfUrl={lease.pdfUrl}
                pdfDisplayName={pdfDisplayName}
              />
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  )
}
