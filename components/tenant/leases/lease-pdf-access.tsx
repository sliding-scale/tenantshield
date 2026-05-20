"use client"

import { useState } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function ViewPdfButton({
  leaseId,
  pdfUrl,
  label = "View PDF",
  className,
}: {
  leaseId: Id<"leases">
  pdfUrl: string | null
  label?: string
  className?: string
}) {
  const fetchPdf = useAction(api.lease.actions.getLeasePdfUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPdf = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer")
      return
    }

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
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="cta"
        className="w-full"
        onClick={() => void openPdf()}
        disabled={loading}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <ShieldLoader variant="lease" compact />
            Opening…
          </span>
        ) : (
          label
        )}
      </Button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

export function LeasePdfSidebarCard({
  leaseId,
  pdfUrl,
  pdfDisplayName,
  className,
  buttonLabel = "View PDF",
}: {
  leaseId: Id<"leases">
  pdfUrl: string | null
  pdfDisplayName: string | null
  className?: string
  buttonLabel?: string
}) {
  const displayName = pdfDisplayName?.trim() || "Lease document"

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Document
      </p>
      <p className="mt-2 truncate font-semibold text-foreground" title={displayName}>
        {displayName}
      </p>
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block w-full"
        >
          <Button variant="cta" className="w-full">
            {buttonLabel}
          </Button>
        </a>
      ) : (
        <ViewPdfButton
          leaseId={leaseId}
          pdfUrl={pdfUrl}
          label={buttonLabel}
          className="mt-3"
        />
      )}
    </div>
  )
}
