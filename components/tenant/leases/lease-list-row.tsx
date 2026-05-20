"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { FileSearch, Trash2 } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { LeaseVerdictTag } from "@/components/shared/list-row-pill"
import { Button } from "@/components/ui/button"
import { BrandedAlertDialog } from "@/components/ui/branded-alert-dialog"

type LeaseListItem = {
  _id: Id<"leases">
  state: string
  leaseReview: string
  documentSummary: string
  verdict: "good" | "negotiate" | "avoid" | "unknown"
  redFlagsCount: number
  missingClausesCount: number
  issuesCount: number
}

export function LeaseListRow({ item }: { item: LeaseListItem }) {
  const deleteLease = useMutation(api.lease.mutations.deleteLeaseForCurrentUser)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = item.leaseReview || "Lease Review"

  const handleDelete = async () => {
    setError(null)
    setIsDeleting(true)
    try {
      await deleteLease({ leaseId: item._id })
      setConfirmOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete lease")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <article className="flex items-stretch gap-2 rounded-3xl border border-border bg-card transition hover:bg-accent sm:gap-3">
        <Link
          href={`/leases/${item._id}`}
          className="min-w-0 flex-1 p-4 sm:p-5 md:p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {item.state} · Lease Analysis
            </p>
            <LeaseVerdictTag verdict={item.verdict} />
          </div>
          <h2 className="mt-1.5 line-clamp-2 break-words text-balance font-heading text-xl font-semibold leading-snug text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {item.documentSummary}
          </p>
          {item.issuesCount > 0 ? (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
              {item.redFlagsCount > 0 ? (
                <span>
                  {item.redFlagsCount} red flag{item.redFlagsCount === 1 ? "" : "s"}
                </span>
              ) : null}
              {item.missingClausesCount > 0 ? (
                <span>
                  {item.missingClausesCount} missing clause
                  {item.missingClausesCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <FileSearch className="size-4" />
            View analysis
          </div>
        </Link>

        <div className="flex shrink-0 flex-col items-end justify-start p-3 sm:p-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Delete lease: ${title}`}
            disabled={isDeleting}
            onClick={() => {
              setError(null)
              setConfirmOpen(true)
            }}
            className="size-10 rounded-xl border-border bg-background text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive sm:size-11"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </article>

      <BrandedAlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setConfirmOpen(open)
        }}
        title="Delete this lease?"
        description={
          error
            ? `${error} This cannot be undone.`
            : `“${title}” will be permanently deleted, including any uploaded PDF and analysis. This cannot be undone.`
        }
        eyebrow="Delete lease"
        eyebrowVariant="destructive"
        iconVariant="destructive"
        cancelLabel="Keep lease"
        actionLabel="Delete lease"
        actionVariant="destructive"
        onAction={handleDelete}
        isActionLoading={isDeleting}
      />
    </>
  )
}
