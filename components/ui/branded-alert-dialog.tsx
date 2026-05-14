"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface BrandedAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  eyebrow?: string
  eyebrowVariant?: "primary" | "destructive"
  icon?: React.ReactNode
  iconVariant?: "warning" | "destructive" | "primary"
  cancelLabel?: string
  actionLabel: string | React.ReactNode
  actionVariant?: "surface-strong" | "destructive"
  onAction: () => void | Promise<void>
  isActionLoading?: boolean
}

export function BrandedAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  eyebrowVariant = "primary",
  icon,
  iconVariant = "warning",
  cancelLabel = "Not now",
  actionLabel,
  actionVariant = "surface-strong",
  onAction,
  isActionLoading = false,
}: BrandedAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        overlayClassName="bg-black/60 backdrop-blur-sm"
        className="w-[calc(100vw-2rem)] max-w-xl gap-0 overflow-hidden rounded-[2rem] border border-cream-border bg-cream-surface p-0 text-ink-warm shadow-2xl ring-0 sm:max-w-2xl"
      >
        <div className="px-6 py-7 sm:px-8 sm:py-9">
          {eyebrow && (
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm",
                eyebrowVariant === "primary" ? "text-primary" : "text-destructive"
              )}
            >
              {eyebrow}
            </p>
          )}
          <div className={cn("flex items-start gap-4 sm:gap-5", eyebrow ? "mt-4 sm:mt-5" : "")}>
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-cream-border bg-cream-surface-deep sm:size-16">
              {icon || (
                <AlertTriangle
                  className={cn(
                    "size-7 sm:size-8",
                    iconVariant === "warning" && "text-warning",
                    iconVariant === "destructive" && "text-destructive",
                    iconVariant === "primary" && "text-primary"
                  )}
                />
              )}
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
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              "h-12 min-h-11 w-full rounded-2xl border-0 px-6 text-base font-semibold text-white sm:w-auto",
              actionVariant === "surface-strong" && "bg-surface-strong hover:bg-surface-strong-hover",
              actionVariant === "destructive" && "bg-destructive hover:bg-destructive/90"
            )}
            onClick={(e) => {
              e.preventDefault()
              onAction()
            }}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              actionLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
