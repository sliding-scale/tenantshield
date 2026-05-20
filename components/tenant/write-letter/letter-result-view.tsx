'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Id } from '@/convex/_generated/dataModel';
import { ArrowLeft, Briefcase, ChevronDown, Copy, Check, Download, Pencil } from 'lucide-react';
import { FadeIn, FadeInStagger } from '@/components/shared/fade-in';
import { UpgradeToViewCta } from '@/components/shared/upgrade-to-view-cta';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { shouldBlurFreeLetterPreview, type PlanId } from '@/lib/plans/plan-access';
import { letterDisplayTitle } from '@/lib/letters/display-title';
import { cn } from '@/lib/utils';

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
    .join('\n\n');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toSafeFileName(value: string) {
  const normalized = value.trim().toLowerCase();
  const safe = normalized
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return safe || 'tenantshield-letter';
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
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
  landlordName: string;
  didCopy: boolean;
  onBack: () => void;
  onCopy: () => void;
  letterBodyOverride?: string;
  letterContentSlot?: ReactNode;
  footerSlot?: ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
  onEditLetter?: () => void;
  headerBeforeCopy?: ReactNode;
  caseId?: Id<'cases'>;
  propertyAddress?: string;
};

export function LetterResultView({
  letterData,
  createdUnderPlan,
  letterType,
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
  propertyAddress,
}: LetterResultViewProps) {
  const blurLetter = shouldBlurFreeLetterPreview(createdUnderPlan);
  const fullText = letterBodyOverride ?? buildFullLetterText(letterData);
  const fileBaseName = toSafeFileName(letterData.header.subjectLine || letterData.metadata.letterTitle || letterType);
  const subjectLine = letterData.header.subjectLine || letterData.metadata.letterTitle || 'Demand Letter';
  const titleText = heroTitle ?? letterDisplayTitle(subjectLine, 'Demand Letter', propertyAddress);

  const onDownloadDoc = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5;">${escapeHtml(
      fullText,
    )}</pre></body></html>`;
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
    triggerBlobDownload(blob, `${fileBaseName}.doc`);
  };

  const onDownloadPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 48;
    const lineHeight = 18;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont('times', 'normal');
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
    <main className='flex min-h-svh min-w-0 flex-col overflow-x-hidden bg-background pb-8 pt-5 md:min-h-svh md:pb-10 md:pt-6 lg:pt-8'>
      <div className='mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 sm:px-6 md:px-8'>
        <header className='mb-6 grid grid-cols-[2.75rem_1fr_auto] items-center gap-2 sm:gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={onBack}
            className='h-11 w-11 rounded-full border-border bg-accent p-0 text-foreground'
            aria-label='Back to letters'
          >
            <ArrowLeft className='size-5' />
          </Button>
          <h1 className='text-center font-heading text-xl font-semibold text-foreground sm:text-2xl'>Letter</h1>
          <div className='flex min-h-11 min-w-0 items-center justify-end gap-2'>
            {headerBeforeCopy}
            <Button
              type='button'
              variant='outline'
              onClick={onCopy}
              disabled={blurLetter}
              className='h-11 w-11 shrink-0 rounded-full border-border bg-accent p-0 text-foreground'
              aria-label={didCopy ? 'Copied' : 'Copy letter'}
            >
              {didCopy ? <Check className='size-5' /> : <Copy className='size-5' />}
            </Button>
          </div>
        </header>

        <FadeInStagger className='flex flex-1 flex-col space-y-6 md:space-y-4 lg:mx-auto lg:w-full lg:max-w-4xl'>
          <FadeIn stagger>
            <h2
              className={cn(
                'font-heading font-semibold leading-tight text-foreground text-balance',
                heroTitle ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl md:text-5xl',
              )}
            >
              {titleText}
            </h2>
            {onEditLetter ? (
              <div className='mt-3 flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={onEditLetter}
                  className='h-9 gap-1.5 rounded-xl px-3 text-xs font-semibold'
                >
                  <Pencil className='size-3.5' />
                  Edit letter
                </Button>
              </div>
            ) : null}
            {heroSubtitle ? (
              <p className='mt-3 text-sm text-muted-foreground text-pretty sm:text-base'>{heroSubtitle}</p>
            ) : null}
          </FadeIn>

          <FadeIn stagger>
            <div
              className={cn(
                'overflow-hidden rounded-3xl border border-border bg-card px-5 py-6 sm:px-7 sm:py-8',
                blurLetter && 'relative min-h-72',
              )}
            >
              {letterContentSlot ?? (
                <pre
                  className={cn(
                    'whitespace-pre-wrap wrap-break-word font-sans text-sm leading-relaxed text-foreground sm:text-base',
                    blurLetter && 'blur-sm select-none',
                  )}
                >
                  {fullText}
                </pre>
              )}
              {blurLetter ? (
                <UpgradeToViewCta
                  eyebrow='Letter preview'
                  title='Upgrade to view this letter'
                  description='Unlock the full letter text, copy it, and export without the free-plan preview limit.'
                  actionLabel='Upgrade to view it'
                />
              ) : null}
            </div>
          </FadeIn>

          {!letterContentSlot ? (
            <FadeIn stagger>
              <div className='rounded-3xl border border-border bg-background px-5 py-5 sm:px-6 sm:py-6'>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground'>Delivery tips</p>
                <ul className='mt-3 space-y-2 text-sm text-foreground'>
                  <li className='leading-relaxed'>
                    Send via USPS Certified Mail with Return Receipt — creates a paper trail.
                  </li>
                  <li className='leading-relaxed'>Keep a copy with the postmark receipt.</li>
                  <li className='leading-relaxed'>
                    Give the deadline you set before escalating to small claims court.
                  </li>
                </ul>
              </div>
            </FadeIn>
          ) : null}

          <FadeIn stagger>
            {footerSlot ?? (
              <div className='flex w-full items-stretch gap-2 pt-2'>
                {caseId ? (
                  <Button
                    asChild
                    variant='outline'
                    size='lg'
                    className='h-10 min-w-0 flex-1 gap-1.5 rounded-xl px-3 text-sm font-semibold sm:px-4'
                  >
                    <Link href={`/cases/${caseId}`} className='inline-flex items-center justify-center gap-1.5'>
                      <Briefcase className='size-4 shrink-0' aria-hidden />
                      View case
                    </Link>
                  </Button>
                ) : null}
                <Button
                  type='button'
                  variant='outline'
                  size='lg'
                  onClick={onCopy}
                  disabled={blurLetter}
                  className='h-10 min-w-0 flex-1 gap-1.5 rounded-xl px-3 text-sm font-semibold sm:px-4'
                >
                  {didCopy ? (
                    <Check className='size-4 shrink-0' aria-hidden />
                  ) : (
                    <Copy className='size-4 shrink-0' aria-hidden />
                  )}
                  {didCopy ? 'Copied' : 'Copy'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type='button'
                      variant='default'
                      size='lg'
                      disabled={blurLetter}
                      className='h-10 min-w-0 flex-1 gap-1.5 rounded-xl px-3 text-sm font-semibold sm:px-4'
                    >
                      <Download className='size-4 shrink-0' />
                      Download
                      <ChevronDown className='size-3.5 shrink-0 opacity-80' aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='min-w-36'>
                    <DropdownMenuItem onSelect={() => void onDownloadPdf()}>PDF</DropdownMenuItem>
                    <DropdownMenuItem onSelect={onDownloadDoc}>DOCX</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </FadeIn>
        </FadeInStagger>
      </div>
    </main>
  );
}
