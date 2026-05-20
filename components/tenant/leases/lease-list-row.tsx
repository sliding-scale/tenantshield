"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { ChevronRight, EllipsisVertical, Trash2 } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { LeaseVerdictTag } from "@/components/shared/list-row-pill"
import { BrandedAlertDialog } from "@/components/ui/branded-alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  const stats: string[] = []
  if (item.redFlagsCount > 0) {
    stats.push(`${item.redFlagsCount} red flag${item.redFlagsCount === 1 ? "" : "s"}`)
  }
  if (item.missingClausesCount > 0) {
    stats.push(`${item.missingClausesCount} missing clause${item.missingClausesCount === 1 ? "" : "s"}`)
  }

  return (
    <>
      <article className="group relative">
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Lease options: ${title}`}
                className="size-9 rounded-xl text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <EllipsisVertical className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem
                variant="destructive"
                disabled={isDeleting}
                onSelect={(event) => {
                  event.preventDefault()
                  setError(null)
                  setConfirmOpen(true)
                }}
              >
                <Trash2 aria-hidden />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/leases/${item._id}`} className="block">
          <Card className="gap-0 rounded-3xl border border-border py-0 shadow-none ring-0 transition hover:bg-accent">
            <div className="flex flex-col gap-2 px-4 py-4 sm:px-5 sm:py-5 md:gap-3 md:px-6 md:py-6">
              <div className="flex flex-wrap items-center gap-2 pr-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {item.state} · Lease Analysis
                </p>
                <LeaseVerdictTag verdict={item.verdict} />
              </div>
              <h2 className="line-clamp-2 break-words text-balance font-heading text-xl font-semibold leading-snug text-foreground sm:text-2xl md:text-3xl">
                {title}
              </h2>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.documentSummary}
              </p>
              <div className="mt-1 flex items-center justify-between gap-3">
                {stats.length > 0 ? (
                  <p className="text-xs font-medium text-muted-foreground md:text-sm">
                    {stats.join(" · ")}
                  </p>
                ) : (
                  <span />
                )}
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground transition group-hover:text-foreground sm:size-6"
                  aria-hidden
                />
              </div>
            </div>
          </Card>
        </Link>
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
