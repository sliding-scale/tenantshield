import type { ComponentType } from "react"
import {
  AlertTriangle,
  CircleHelp,
  FileText,
  Gavel,
  Scale,
  Shield,
  TrendingUp,
  Wrench,
} from "lucide-react"
import {
  ISSUE_TYPES,
  type IssueTypeIconKey,
} from "@/lib/constants/issue-types"
import { cn } from "@/lib/utils"

const ISSUE_TYPE_ICONS: Record<IssueTypeIconKey, ComponentType<{ className?: string }>> = {
  gavel: Gavel,
  wrench: Wrench,
  "alert-triangle": AlertTriangle,
  "trending-up": TrendingUp,
  "file-text": FileText,
  shield: Shield,
  scale: Scale,
  "circle-help": CircleHelp,
}

function resolveIconKey(issueType: string): IssueTypeIconKey {
  const match = ISSUE_TYPES.find((type) => type.value === issueType)
  return match?.iconKey ?? "circle-help"
}

export function IssueTypeIcon({
  issueType,
  className,
  iconClassName,
}: {
  issueType: string
  className?: string
  iconClassName?: string
}) {
  const iconKey = resolveIconKey(issueType)
  const Icon = ISSUE_TYPE_ICONS[iconKey]
  const label = ISSUE_TYPES.find((type) => type.value === issueType)?.value ?? issueType

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary",
        className,
      )}
      title={label}
      aria-label={label}
    >
      <Icon className={cn("size-3.5", iconClassName)} aria-hidden />
    </span>
  )
}
