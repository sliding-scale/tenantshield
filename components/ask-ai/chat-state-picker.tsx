"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASK_AI_DEFAULT_STATE_CODE } from "@/lib/chat/ask-ai-state";
import { US_STATE_NAMES, US_STATES } from "@/lib/constants/us-states";
import { cn } from "@/lib/utils";

const US_STATE_CODES_SORTED = [...US_STATES].sort((a, b) => a.localeCompare(b));

/** ~104px: reads like a normal compact select, fits “CA” + chevron */
const DROPDOWN_W =
  "w-[6.5rem] min-w-[6.5rem] max-w-[6.5rem] sm:w-[7rem] sm:min-w-[7rem] sm:max-w-[7rem]";

export type ChatStatePickerProps = {
  value: string | null;
  onChange: (stateCode: string) => void;
  className?: string;
  id?: string;
};

const itemClass = cn(
  "justify-center py-2 pr-8 pl-2 font-mono text-sm font-semibold tracking-wide text-ink-warm",
  "focus:bg-cream-surface dark:text-ink-warm dark:focus:bg-surface-strong",
);

/**
 * US state selector for Ask AI. Defaults to FL when unset.
 */
export default function ChatStatePicker({
  value,
  onChange,
  className,
  id = "ask-ai-state",
}: ChatStatePickerProps) {
  const displayValue = value ?? ASK_AI_DEFAULT_STATE_CODE;

  return (
    <div className={cn("shrink-0", DROPDOWN_W, className)}>
      <label htmlFor={id} className="sr-only">
        State for legal context (US abbreviation)
      </label>
      <Select value={displayValue} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          size="sm"
          className={cn(
            DROPDOWN_W,
            "h-8 gap-1 rounded-lg border-cream-border bg-cream-surface-soft px-2 py-0",
            "font-mono text-sm font-semibold tracking-wide text-ink-warm shadow-sm",
            "hover:bg-cream-surface data-[size=sm]:h-8",
            "dark:border-cream-border dark:bg-cream-surface-soft dark:text-ink-warm dark:hover:bg-surface-strong",
            "justify-between [&>span]:min-w-0",
            "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-warm-muted",
          )}
          aria-label="Select US state (two-letter code) for tenant law context"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          align="end"
          className={cn(
            DROPDOWN_W,
            "overflow-hidden rounded-lg border border-cream-border bg-cream-page p-1",
            "text-ink-warm shadow-md ring-0 dark:bg-cream-surface-soft dark:text-ink-warm",
            "max-h-[min(20rem,65dvh)]",
            "[&_[data-slot=select-scroll-up-button]]:bg-cream-page dark:[&_[data-slot=select-scroll-up-button]]:bg-cream-surface-soft",
            "[&_[data-slot=select-scroll-down-button]]:bg-cream-page dark:[&_[data-slot=select-scroll-down-button]]:bg-cream-surface-soft",
          )}
        >
          {US_STATE_CODES_SORTED.map((code) => (
            <SelectItem
              key={code}
              value={code}
              title={US_STATE_NAMES[code]}
              className={itemClass}
            >
              {code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
