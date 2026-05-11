"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { ArrowLeft } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  LeaseResultsView,
  type LeaseAnalysis,
} from "@/components/tenant/analyze-lease/lease-results-view"

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
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Invalid lease id.</p>
      </main>
    )
  }

  if (lease === undefined) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Loading lease...</p>
      </main>
    )
  }

  if (!lease) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Lease not found.</p>
      </main>
    )
  }

  if (!lease.aiAnalysis) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">
          This lease has not finished analyzing yet. Please check back shortly.
        </p>
      </main>
    )
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/leases")}
            className="h-10 rounded-xl border-cream-border bg-cream-surface-deep px-3 text-sm font-semibold text-ink-warm hover:bg-cream-surface sm:h-11 sm:px-4 sm:text-base"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to leases
          </Button>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted md:text-sm">
            {lease.state}
          </p>
        </div>
        <LeaseResultsView analysis={lease.aiAnalysis as LeaseAnalysis} />
      </div>
    </main>
  )
}
