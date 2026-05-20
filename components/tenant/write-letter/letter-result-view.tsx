"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import { Briefcase, Copy, ChevronLeft, Pencil, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeToViewCta } from "@/components/shared/upgrade-to-view-cta";
import {
  shouldBlurFreeLetterPreview,
  type PlanId,
} from "@/lib/plans/plan-access";
import { cn } from "@/lib/utils";

export type LetterData = {
  metadata: {
    letterTitle: string;
    recipientName: string;
    senderName: string;
    state: string;
  };
  header: {
    senderAddress: string;
    landlordAddress: string;
    date: string;
    subjectLine: string;
  };
  salutation: string;
  paragraphs: Array<{
    type: string;
    content: string;
    statutes_cited?: string[];
  }>;
  signOff: string;
};

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
    .join("\n\n");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toSafeFileName(value: string) {
  const normalized = value.trim().toLowerCase();
  const safe = normalized
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return safe || "tenantshield-letter";
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

type LetterResultViewProps = {
  letterData: LetterData;
  createdUnderPlan?: PlanId | null;
  letterType: string;
  stateName: string;
  landlordName: string;
  didCopy: boolean;
  onBack: () => void;
  onCopy: () => void;
  /** When set, shown in the letter card instead of reconstructing from `letterData` (e.g. saved `fullLetterText`). */
  letterBodyOverride?: string;
  /** Replace the letter body `<pre>` (e.g. TipTap editor). */
  letterContentSlot?: ReactNode;
  /** Replace the bottom bar (e.g. Save / Cancel while editing). */
  footerSlot?: ReactNode;
  /** Heading under the meta line (default: "Your letter is ready."). */
  heroTitle?: string;
  /** Subtitle under the hero title. */
  heroSubtitle?: string;
  /** Show an "Edit letter" control under the subtitle (read mode). */
  onEditLetter?: () => void;
  /** Extra controls in the header row, before the copy icon (e.g. rate CTA). */
  headerBeforeCopy?: ReactNode;
  /** When set, shows a link to the case this letter was generated from. */
  caseId?: Id<"cases">;
};

export function LetterResultView({
  letterData,
  createdUnderPlan,
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
  headerBeforeCopy,
  caseId,
}: LetterResultViewProps) {
  const blurLetter = shouldBlurFreeLetterPreview(createdUnderPlan);
  const fullText = letterBodyOverride ?? buildFullLetterText(letterData);
  const fileBaseName = toSafeFileName(
    letterData.header.subjectLine ||
      letterData.metadata.letterTitle ||
      letterType,
  );
  const metaLine = `${(stateName || letterData.metadata.state || "—").toUpperCase()} · TO ${(
    letterData.metadata.recipientName ||
    landlordName ||
    "—"
  ).toUpperCase()}`;

  const titleText = heroTitle ?? "Your letter is ready.";
  const subtitleText =
    heroSubtitle ??
    "Review, copy, print, and deliver (certified mail recommended).";

  const onDownloadDoc = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5;">${escapeHtml(
      fullText,
    )}</pre></body></html>`;
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    triggerBlobDownload(blob, `${fileBaseName}.doc`);
  };

  const onDownloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const lineHeight = 18;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(fullText, maxWidth);
    let cursorY = margin;

    for (const line of lines) {
      if (cursorY > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    }

    doc.save(`${fileBaseName}.pdf`);
  };

  return (
    <main
      className={cn(
        "flex min-h-svh flex-col bg-background pt-5 md:min-h-svh md:pb-10 md:pt-6 lg:pt-8",
        caseId
          ? "pb-[calc(22rem+env(safe-area-inset-bottom,0px))]"
          : "pb-[calc(18rem+env(safe-area-inset-bottom,0px))]",
      )}
    >
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <header className="mb-5 grid grid-cols-[2.75rem_1fr_auto] items-center gap-2 md:mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-11 w-11 rounded-full border-border bg-accent p-0 text-foreground"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h1 className="min-w-0 text-center font-heading text-base font-semibold text-foreground sm:text-2xl">
            {letterData.metadata.letterTitle || letterType}
          </h1>
          <div className="flex min-w-0 items-center justify-end gap-2">
            {headerBeforeCopy}
            <Button
              type="button"
              variant="outline"
              onClick={onCopy}
              disabled={blurLetter}
              className="h-11 w-11 shrink-0 rounded-full border-border bg-accent p-0 text-foreground"
              aria-label="Copy letter"
            >
              <Copy className="size-5" />
            </Button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {metaLine}
          </p>
          <h2 className="mt-3 font-heading text-4xl font-semibold leading-[0.95] text-foreground sm:text-5xl">
            {titleText}
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {subtitleText}
          </p>

          {onEditLetter ? (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onEditLetter}
                className="rounded-2xl border-border bg-muted px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-card"
              >
                <span className="inline-flex items-center gap-2">
                  <Pencil className="size-4" />
                  Edit letter
                </span>
              </Button>
            </div>
          ) : null}

          <div
            className={cn(
              "mt-6 overflow-hidden rounded-3xl border border-border bg-background px-5 py-6 shadow-sm sm:px-7 sm:py-8",
              blurLetter && "relative min-h-[18rem]",
            )}
          >
            {letterContentSlot ?? (
              <pre
                className={cn(
                  "whitespace-pre-wrap break-words font-sans text-base leading-relaxed text-foreground",
                  blurLetter && "blur-sm select-none",
                )}
              >
                {fullText}
              </pre>
            )}
            {blurLetter ? (
              <UpgradeToViewCta
                eyebrow="Letter preview"
                title="Upgrade to view this letter"
                description="Unlock the full letter text, copy it, and export without the free-plan preview limit."
                actionLabel="Upgrade to view it"
              />
            ) : null}
          </div>

          {!letterContentSlot ? (
            <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Delivery tips
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground sm:text-base">
                <li className="leading-relaxed text-foreground">
                  Send via USPS Certified Mail with Return Receipt — creates a
                  paper trail.
                </li>
                <li className="leading-relaxed text-foreground">
                  Keep a copy with the postmark receipt.
                </li>
                <li className="leading-relaxed text-foreground">
                  Give the deadline you set before escalating to small claims
                  court.
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-background/80 px-4 pb-6 pt-3 backdrop-blur md:static md:mt-6 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-0">
        <div className="mx-auto w-full max-w-3xl">
          {footerSlot ?? (
            <div className="flex flex-col gap-2">
              {caseId ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-14 w-full rounded-2xl border-border bg-muted px-6 text-lg font-semibold text-foreground hover:bg-card"
                >
                  <Link
                    href={`/cases/${caseId}`}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <Briefcase className="size-5 shrink-0" aria-hidden />
                    View case
                  </Link>
                </Button>
              ) : null}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onDownloadPdf()}
                  disabled={blurLetter}
                  className="h-14 w-full rounded-2xl border-border bg-background px-5 text-base font-semibold text-foreground hover:bg-accent"
                >
                  <span className="inline-flex items-center gap-2">
                    <Download className="size-4" />
                    Download PDF
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onDownloadDoc}
                  disabled={blurLetter}
                  className="h-14 w-full rounded-2xl border-border bg-background px-5 text-base font-semibold text-foreground hover:bg-accent"
                >
                  <span className="inline-flex items-center gap-2">
                    <Download className="size-4" />
                    Download DOC
                  </span>
                </Button>
              </div>
              <Button
                type="button"
                onClick={onCopy}
                disabled={blurLetter}
                className="h-14 w-full rounded-2xl bg-foreground px-6 text-lg font-semibold text-white hover:bg-foreground/90"
              >
                {didCopy ? "Copied!" : "Copy full letter"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
