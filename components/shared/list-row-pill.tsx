import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type ListRowPillTone = "good" | "negotiate" | "avoid" | "muted"

const toneClass: Record<ListRowPillTone, string> = {
  good: "border-primary/30 bg-primary/15 text-primary",
  negotiate: "border-secondary/30 bg-secondary/15 text-secondary",
  avoid: "border-destructive/30 bg-destructive/15 text-destructive",
  muted: "border-border bg-background text-muted-foreground",
}

const pillBase =
  "inline-flex h-6 max-w-full min-w-0 items-center justify-center truncate rounded-full border px-2.5 text-[0.65rem] font-semibold uppercase leading-none tracking-[0.12em] sm:h-7 sm:max-w-md sm:px-3 sm:text-xs"

export function ListRowPill({
  tone,
  children,
  className,
}: {
  tone: ListRowPillTone
  children: ReactNode
  className?: string
}) {
  return <span className={cn(pillBase, toneClass[tone], className)}>{children}</span>
}

export function LeaseVerdictTag({
  verdict,
}: {
  verdict: "good" | "negotiate" | "avoid" | "unknown"
}) {
  const config = {
    good: { label: "Do Sign", tone: "good" as const },
    negotiate: { label: "Negotiate", tone: "negotiate" as const },
    avoid: { label: "Do Not Sign", tone: "avoid" as const },
    unknown: { label: "Review", tone: "muted" as const },
  }[verdict]

  return <ListRowPill tone={config.tone}>{config.label}</ListRowPill>
}

/** Maps case strength score to the same tone family as lease verdict pills. */
export function caseStrengthPillTone(score: number): ListRowPillTone {
  if (score >= 75) return "good"
  if (score >= 40) return "negotiate"
  return "avoid"
}
