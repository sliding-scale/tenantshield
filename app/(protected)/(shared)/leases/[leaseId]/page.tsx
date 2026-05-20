"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useAction } from "convex/react"
import { useState } from "react"
import { ChevronLeft, EllipsisVertical, FileText } from "lucide-react"
import { ShieldLoader } from "@/components/shared/shield-loader"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LeaseResultsView,
  type LeaseAnalysis,
} from "@/components/tenant/analyze-lease/lease-results-view"

function LeasePdfSidebarCard({
  leaseId,
  pdfUrl,
  pdfDisplayName,
}: {
  leaseId: Id<"leases">
  pdfUrl: string | null
  pdfDisplayName: string | null
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {pdfDisplayName ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Document
          </p>
          <p className="mt-2 truncate font-semibold text-foreground">{pdfDisplayName}</p>
        </>
      ) : null}
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className={pdfDisplayName ? "mt-3 inline-block w-full" : "inline-block w-full"}
        >
          <Button className="w-full">{pdfDisplayName ? "Open PDF" : "Download PDF"}</Button>
        </a>
      ) : (
        <div className={pdfDisplayName ? "mt-3" : undefined}>
          <TryLoadPdfButton leaseId={leaseId} label={pdfDisplayName ? "Open PDF" : "Download PDF"} />
        </div>
      )}
    </div>
  )
}

function LeaseDocumentMenu({
  leaseId,
  pdfUrl,
  pdfDisplayName,
}: {
  leaseId: Id<"leases">
  pdfUrl: string | null
  pdfDisplayName: string | null
}) {
  const fetchPdf = useAction(api.lease.actions.getLeasePdfUrl)
  const [loading, setLoading] = useState(false)

  const openPdf = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer")
      return
    }

    setLoading(true)
    try {
      const url = await fetchPdf({ leaseId })
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer")
      }
    } finally {
      setLoading(false)
    }
  }

  const actionLabel = pdfDisplayName ?? (pdfUrl ? "Open PDF" : "Download PDF")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Lease options"
          className="size-11 shrink-0 rounded-full border-border bg-accent text-foreground"
        >
          <EllipsisVertical className="size-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem disabled={loading} onSelect={() => void openPdf()}>
          <FileText aria-hidden />
          {loading ? "OpeningΓÇª" : actionLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TryLoadPdfButton({
  leaseId,
  label = "Download PDF",
}: {
  leaseId: Id<"leases">
  label?: string
}) {
  const fetchPdf = useAction(api.lease.actions.getLeasePdfUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <Button
        className="w-full"
        onClick={async () => {
          setError(null)
          setLoading(true)
          try {
            const url = await fetchPdf({ leaseId })
            if (url) {
              window.open(url, "_blank", "noopener,noreferrer")
            } else {
              setError("Could not load PDF. Try again in a moment.")
            }
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <ShieldLoader variant="lease" compact />
            LoadingΓÇª
          </span>
        ) : (
          label
        )}
      </Button>
      {error ? <div className="mt-2 text-sm text-destructive">{error}</div> : null}
    </div>
  )
}

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
          <div className="mb-4 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 sm:grid-cols-[2.75rem_1fr_auto] sm:gap-3 md:mb-6">
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
            {hasPdf ? (
              <div className="flex justify-end lg:hidden">
                <LeaseDocumentMenu
                  leaseId={leaseId}
                  pdfUrl={lease.pdfUrl}
                  pdfDisplayName={pdfDisplayName}
                />
              </div>
            ) : (
              <span className="size-11 shrink-0" aria-hidden />
            )}
          </div>
          <LeaseResultsView
            analysis={lease.aiAnalysis as LeaseAnalysis}
            createdUnderPlan={lease.createdUnderPlan}
            flatHeader
            hideEyebrow
          />
        </div>

        {hasPdf ? (
          <aside className="hidden self-start lg:block lg:w-72 lg:pl-6">
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
