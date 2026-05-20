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
  "justify-center py-2 pr-8 pl-2 font-mono text-sm font-semibold tracking-wide text-foreground",
  "focus:bg-card dark:text-foreground dark:focus:bg-foreground",
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
            "h-8 gap-1 rounded-lg border-border bg-accent px-2 py-0",
            "font-mono text-sm font-semibold tracking-wide text-foreground shadow-sm",
            "hover:bg-card data-[size=sm]:h-8",
            "dark:border-border dark:bg-accent dark:text-foreground dark:hover:bg-foreground/90",
            "justify-between [&>span]:min-w-0",
            "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
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
            "overflow-hidden rounded-lg border border-border bg-background p-1",
            "text-foreground shadow-md ring-0 dark:bg-accent dark:text-foreground",
            "max-h-[min(20rem,65svh)]",
            "[&_[data-slot=select-scroll-up-button]]:bg-background dark:[&_[data-slot=select-scroll-up-button]]:bg-accent",
            "[&_[data-slot=select-scroll-down-button]]:bg-background dark:[&_[data-slot=select-scroll-down-button]]:bg-accent",
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
