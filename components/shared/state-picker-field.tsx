"use client"

import { useMemo, useState } from "react"
import { MapPin, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { US_STATES, US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-11 w-full rounded-2xl border border-border bg-card px-4 text-left text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

type StatePickerFieldProps = {
  state: string
  onStateChange: (value: string) => void
  className?: string
  showLabel?: boolean
}

export function StatePickerField({
  state,
  onStateChange,
  className,
  showLabel = true,
}: StatePickerFieldProps) {
  const [isEditingState, setIsEditingState] = useState(false)

  const selectedStateName = useMemo(
    () => (state ? US_STATE_NAMES[state as USStateAbbr] : ""),
    [state],
  )

  const showStatePicker = !state || isEditingState

  const handleStateChange = (value: string) => {
    onStateChange(value)
    setIsEditingState(false)
  }

  return (
    <div className={className}>
      {showLabel ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          State
        </p>
      ) : null}
      {showStatePicker ? (
        <Select value={state || undefined} onValueChange={handleStateChange}>
          <SelectTrigger className={cn(fieldClass, showLabel && "mt-2")}>
            <SelectValue placeholder="Select your state…" />
          </SelectTrigger>
          <SelectContent position="popper">
            {US_STATES.map((abbr) => (
              <SelectItem key={abbr} value={abbr}>
                {US_STATE_NAMES[abbr]} ({abbr})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2.5",
            showLabel && "mt-2",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-foreground">
              <MapPin className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-foreground">{selectedStateName}</p>
              <p className="text-left text-xs text-muted-foreground">{state}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 px-2 text-xs font-semibold text-primary"
            onClick={() => setIsEditingState(true)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Change
          </Button>
        </div>
      )}
    </div>
  )
}
