"use client"

import type { ReactNode } from "react"
import { Copy, ChevronLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

export type LetterData = {
  metadata: {
    letterTitle: string
    recipientName: string
    senderName: string
    state: string
  }
  header: {
    senderAddress: string
    landlordAddress: string
    date: string
    subjectLine: string
  }
  salutation: string
  paragraphs: Array<{ type: string; content: string; statutes_cited?: string[] }>
  signOff: string
}

function buildFullLetterText(letterData: LetterData) {
  return [
    letterData.header.date,
    letterData.header.senderAddress,
    letterData.header.landlordAddress,
    `RE: ${letterData.header.subjectLine}`,
    letterData.salutation,
    ...letterData.paragraphs.map((p) => p.content),
    letterData.signOff,
  ]
    .filter(Boolean)
    .join("\n\n")
}

type LetterResultViewProps = {
  letterData: LetterData
  letterType: string
  stateName: string
  landlordName: string
  didCopy: boolean
  onBack: () => void
  onCopy: () => void
  /** When set, shown in the letter card instead of reconstructing from `letterData` (e.g. saved `fullLetterText`). */
  letterBodyOverride?: string
  /** Replace the letter body `<pre>` (e.g. TipTap editor). */
  letterContentSlot?: ReactNode
  /** Replace the bottom bar (e.g. Save / Cancel while editing). */
  footerSlot?: ReactNode
  /** Heading under the meta line (default: "Your letter is ready."). */
  heroTitle?: string
  /** Subtitle under the hero title. */
  heroSubtitle?: string
  /** Show an "Edit letter" control under the subtitle (read mode). */
  onEditLetter?: () => void
}

export function LetterResultView({
  letterData,
  letterType,
  stateName,
  landlordName,
  didCopy,
  onBack,
  onCopy,
  letterBodyOverride,
  letterContentSlot,
  footerSlot,
  heroTitle,
  heroSubtitle,
  onEditLetter,
}: LetterResultViewProps) {
  const fullText = letterBodyOverride ?? buildFullLetterText(letterData)
  const metaLine = `${(stateName || letterData.metadata.state || "—").toUpperCase()} · TO ${(
    letterData.metadata.recipientName || landlordName || "—"
  ).toUpperCase()}`

  const titleText = heroTitle ?? "Your letter is ready."
  const subtitleText =
    heroSubtitle ?? "Review, copy, print, and deliver (certified mail recommended)."

  return (
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <header className="mb-5 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 md:mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-11 w-11 rounded-full border-border bg-cream-surface-soft p-0 text-foreground"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h1 className="text-center font-heading text-xl font-semibold text-foreground sm:text-2xl">
            {letterData.metadata.letterTitle || letterType}
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={onCopy}
            className="h-11 w-11 rounded-full border-border bg-cream-surface-soft p-0 text-foreground"
            aria-label="Copy letter"
          >
            <Copy className="size-5" />
          </Button>
        </header>

        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{metaLine}</p>
          <h2 className="mt-3 font-heading text-4xl font-semibold leading-[0.95] text-ink-warm sm:text-5xl">
            {titleText}
          </h2>
          <p className="mt-3 text-base text-ink-warm-muted sm:text-lg">{subtitleText}</p>

          {onEditLetter ? (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onEditLetter}
                className="rounded-2xl border-cream-border bg-cream-surface-deep px-4 py-2.5 text-sm font-semibold text-ink-warm hover:bg-cream-surface"
              >
                <span className="inline-flex items-center gap-2">
                  <Pencil className="size-4" />
                  Edit letter
                </span>
              </Button>
            </div>
          ) : null}

          <div className="mt-6 rounded-3xl border border-cream-border bg-background px-5 py-6 shadow-sm sm:px-7 sm:py-8">
            {letterContentSlot ?? (
              <pre className="whitespace-pre-wrap break-words font-sans text-base leading-relaxed text-foreground">
                {fullText}
              </pre>
            )}
          </div>

          {!letterContentSlot ? (
            <div className="mt-6 rounded-3xl border border-cream-border bg-cream-surface p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">Delivery tips</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-warm sm:text-base">
                <li className="leading-relaxed text-foreground">
                  Send via USPS Certified Mail with Return Receipt — creates a paper trail.
                </li>
                <li className="leading-relaxed text-foreground">Keep a copy with the postmark receipt.</li>
                <li className="leading-relaxed text-foreground">
                  Give the deadline you set before escalating to small claims court.
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-cream-page/80 px-4 pb-6 pt-3 backdrop-blur md:static md:mt-6 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-0">
        <div className="mx-auto w-full max-w-3xl">
          {footerSlot ?? (
            <Button
              type="button"
              onClick={onCopy}
              className="h-14 w-full rounded-2xl bg-surface-strong px-6 text-lg font-semibold text-white hover:bg-surface-strong-hover"
            >
              {didCopy ? "Copied!" : "Copy full letter"}
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

