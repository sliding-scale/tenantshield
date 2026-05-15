"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { FileText, Trash2 } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { ListRowPill } from "@/components/shared/list-row-pill"
import { Button } from "@/components/ui/button"
import { BrandedAlertDialog } from "@/components/ui/branded-alert-dialog"

type LetterListItem = {
  _id: Id<"letters">
  inputData: {
    letterType: string
    state: string
    landlordName: string
  }
  letterData?: {
    header?: { subjectLine?: string }
  }
  preview: string
}

export function LetterListRow({ item }: { item: LetterListItem }) {
  const deleteLetter = useMutation(api.letters.mutations.deleteLetterForCurrentUser)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = item.letterData?.header?.subjectLine || "Demand Letter"

  const handleDelete = async () => {
    setError(null)
    setIsDeleting(true)
    try {
      await deleteLetter({ letterId: item._id })
      setConfirmOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete letter")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <article className="flex items-stretch gap-2 rounded-3xl border border-cream-border bg-cream-surface transition hover:bg-cream-surface-soft sm:gap-3">
        <Link
          href={`/letters/${item._id}`}
          className="min-w-0 flex-1 p-4 sm:p-5 md:p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {item.inputData.state} · {item.inputData.letterType}
            </p>
            <ListRowPill tone="muted">
              Recipient · {item.inputData.landlordName || "Landlord"}
            </ListRowPill>
          </div>
          <h2 className="mt-1.5 line-clamp-2 break-words text-balance font-heading text-xl font-semibold leading-snug text-ink-warm sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-warm-muted">
            {item.preview}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="size-4" />
            View letter
          </div>
        </Link>

        <div className="flex shrink-0 flex-col items-end justify-start p-3 sm:p-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Delete letter: ${title}`}
            disabled={isDeleting}
            onClick={() => {
              setError(null)
              setConfirmOpen(true)
            }}
            className="size-10 rounded-xl border-cream-border bg-background text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive sm:size-11"
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
        title="Delete this letter?"
        description={
          error
            ? `${error} This cannot be undone. The letter will be removed from your account and your letter usage count will go down.`
            : `“${title}” will be permanently deleted. This cannot be undone. Your plan’s used letter count will be updated.`
        }
        eyebrow="Delete letter"
        eyebrowVariant="destructive"
        iconVariant="destructive"
        cancelLabel="Keep letter"
        actionLabel="Delete letter"
        actionVariant="destructive"
        onAction={handleDelete}
        isActionLoading={isDeleting}
      />
    </>
  )
}
