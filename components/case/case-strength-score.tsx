"use client"

import {
  caseStrengthPillTone,
  type ListRowPillTone,
} from "@/components/shared/list-row-pill"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { caseStrengthLabel } from "@/lib/case/caseStrengthLabel"
import { cn } from "@/lib/utils"

const toneCircleClass: Record<ListRowPillTone, string> = {
  good: "border-primary/30 bg-primary/15 text-primary",
  negotiate: "border-secondary/30 bg-secondary/15 text-secondary",
  avoid: "border-destructive/30 bg-destructive/15 text-destructive",
  muted: "border-border bg-background text-muted-foreground",
}

type CaseStrengthScoreProps = {
  score: number
  className?: string
}

export function CaseStrengthScore({ score, className }: CaseStrengthScoreProps) {
  const rounded = Math.round(score)
  const tone = caseStrengthPillTone(score)
  const label = caseStrengthLabel(score)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums sm:size-10 sm:text-sm",
            toneCircleClass[tone],
            className,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {rounded}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
