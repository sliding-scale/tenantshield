import { fieldEnterDelays, pageEnterItem } from "@/lib/motion/presets"
import { cn } from "@/lib/utils"

type AuthEnterProps = {
  index?: number
  className?: string
  children: React.ReactNode
}

/** CSS-only staggered enter for auth flows (no framer). */
export function AuthEnter({ index = 0, className, children }: AuthEnterProps) {
  const delay =
    fieldEnterDelays[index] ?? fieldEnterDelays[fieldEnterDelays.length - 1]

  return (
    <div className={cn(pageEnterItem, delay, className)}>{children}</div>
  )
}
