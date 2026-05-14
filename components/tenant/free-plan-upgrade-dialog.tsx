"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type FreePlanUpgradeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  eyebrow?: string
  primaryActionLabel?: string
  primaryActionHref?: string
}

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  title,
  description,
  eyebrow = "Free plan limit",
  primaryActionLabel = "View plans",
  primaryActionHref = "/onboarding/plans",
}: FreePlanUpgradeDialogProps) {
  const router = useRouter()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        overlayClassName="bg-black/60 backdrop-blur-sm"
        className="w-[calc(100vw-2rem)] max-w-xl gap-0 overflow-hidden rounded-[2rem] border border-cream-border bg-cream-surface p-0 text-ink-warm shadow-2xl ring-0 sm:max-w-2xl"
      >
        <div className="px-6 py-7 sm:px-8 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
            {eyebrow}
          </p>
          <div className="mt-4 flex items-start gap-4 sm:mt-5 sm:gap-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-cream-border bg-cream-surface-deep sm:size-16">
              <AlertTriangle className="size-7 text-warning sm:size-8" />
            </div>
            <div className="min-w-0 space-y-3">
              <AlertDialogTitle className="font-heading text-2xl font-semibold leading-tight text-ink-warm sm:text-3xl">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base leading-relaxed text-ink-warm-muted sm:text-lg">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col-reverse gap-3 border-t border-cream-border bg-cream-surface-soft px-6 py-5 sm:flex-row sm:justify-end sm:px-8 sm:py-6">
          <AlertDialogCancel className="h-12 min-h-11 w-full rounded-2xl border-cream-border bg-background px-6 text-base font-semibold text-ink-warm hover:bg-cream-surface sm:w-auto">
            Not now
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-12 min-h-11 w-full rounded-2xl border-0 bg-surface-strong px-6 text-base font-semibold text-white hover:bg-surface-strong-hover sm:w-auto"
            onClick={() => router.push(primaryActionHref)}
          >
            {primaryActionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
