"use client"

import { MapPin } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ASK_AI_DEFAULT_STATE_CODE } from "@/lib/chat/ask-ai-state"
import { US_STATE_NAMES, US_STATES } from "@/lib/constants/us-states"
import { cn } from "@/lib/utils"

const US_STATE_CODES_SORTED = [...US_STATES].sort((a, b) => a.localeCompare(b))

export type ChatStatePickerProps = {
  value: string | null
  onChange: (stateCode: string) => void
  className?: string
  id?: string
}

/** US state pill for Ask AI legal context. */
export default function ChatStatePicker({
  value,
  onChange,
  className,
  id = "ask-ai-state",
}: ChatStatePickerProps) {
  const displayValue = value ?? ASK_AI_DEFAULT_STATE_CODE

  return (
    <div className={cn("shrink-0", className)}>
      <label htmlFor={id} className="sr-only">
        State for legal context (US abbreviation)
      </label>
      <Select value={displayValue} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          size="sm"
          className="h-9 min-w-[5.25rem] gap-1 rounded-full border-border bg-muted px-2.5 font-mono text-sm font-semibold tracking-wide shadow-none"
          aria-label="Select US state (two-letter code) for tenant law context"
        >
          <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          align="end"
          className="max-h-[min(20rem,65svh)]"
        >
          {US_STATE_CODES_SORTED.map((code) => (
            <SelectItem
              key={code}
              value={code}
              title={US_STATE_NAMES[code]}
              className="font-mono text-sm font-semibold tracking-wide"
            >
              {code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
