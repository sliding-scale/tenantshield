"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation } from "convex/react"
import { ChevronRight, EllipsisVertical, Trash2 } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { letterDisplayTitle } from "@/lib/letters/display-title"
import { IssueTypeIcon } from "@/components/shared/issue-type-icon"
import { ListRowPill } from "@/components/shared/list-row-pill"
import { BrandedAlertDialog } from "@/components/ui/branded-alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  const title = letterDisplayTitle(item.letterData?.header?.subjectLine)

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
      <article className="group relative rounded-3xl border border-border bg-card transition hover:bg-accent">
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Letter options: ${title}`}
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

        <Link href={`/letters/${item._id}`} className="flex flex-col p-4 sm:p-5 md:p-5">
          <h2 className="w-full line-clamp-2 wrap-break-word text-balance pr-10 font-heading text-xl font-semibold leading-snug text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 w-full line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {item.preview}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <IssueTypeIcon issueType={item.inputData.letterType} />
              <ListRowPill tone="muted">
                Recipient · {item.inputData.landlordName || "Landlord"}
              </ListRowPill>
            </div>
            <ChevronRight
              className="size-5 shrink-0 text-muted-foreground transition group-hover:text-foreground sm:size-6"
              aria-hidden
            />
          </div>
        </Link>
      </article>

      <BrandedAlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setConfirmOpen(open)
        }}
        title="Delete this letter?"
        description={
          error
            ? `${error} This cannot be undone.`
            : `“${title}” will be permanently deleted. This cannot be undone.`
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
