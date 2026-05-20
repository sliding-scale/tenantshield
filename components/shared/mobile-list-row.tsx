import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type MobileListRowProps = {
  title: string
  subtitle?: string
  Icon: LucideIcon
  href?: string
  onClick?: () => void
  destructive?: boolean
  className?: string
}

const rowInnerClass =
  "group flex min-h-14 w-full items-center gap-3 px-3 py-3.5 text-left transition hover:bg-accent sm:gap-4 sm:px-4 sm:py-4 md:min-h-16"

export function MobileListRow({
  title,
  subtitle,
  Icon,
  href,
  onClick,
  destructive = false,
  className,
}: MobileListRowProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl md:size-12",
          destructive ? "bg-destructive/10 text-destructive" : "bg-accent text-foreground",
        )}
      >
        <Icon className="size-5 md:size-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-heading text-lg font-semibold text-foreground md:text-xl",
            destructive && "text-destructive",
          )}
        >
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-sm leading-snug text-muted-foreground md:text-base">
            {subtitle}
          </span>
        ) : null}
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground transition group-hover:text-foreground"
        aria-hidden
      />
    </>
  )

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden rounded-2xl border border-border py-0 shadow-none ring-0",
        className,
      )}
      size="sm"
    >
      {href ? (
        <Link href={href} className={rowInnerClass}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={rowInnerClass}>
          {content}
        </button>
      )}
    </Card>
  )
}
