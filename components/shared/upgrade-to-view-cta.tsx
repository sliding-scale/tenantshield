"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UpgradeToViewCtaProps = {
  className?: string
  eyebrow?: string
  title?: string
  description?: string
  actionLabel?: string
}

export function UpgradeToViewCta({
  className,
  eyebrow = "Premium preview",
  title = "Upgrade to unlock the full view",
  description = "Choose a paid plan to read the full content, export, and keep your protections active.",
  actionLabel = "View plans",
}: UpgradeToViewCtaProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center bg-background/70 p-4 sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-auto w-full max-w-md rounded-[1.75rem] border border-border bg-card px-6 py-7 text-center shadow-2xl sm:px-8 sm:py-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border bg-muted sm:size-16">
          <Sparkles className="size-7 text-primary sm:size-8" aria-hidden />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
          {eyebrow}
        </p>
        <h3 className="mt-3 font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        <Button
          asChild
          className="mt-6 h-12 w-full rounded-2xl bg-foreground px-6 text-base font-semibold text-white shadow-md hover:bg-foreground/90"
        >
          <Link href="/billing">{actionLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
