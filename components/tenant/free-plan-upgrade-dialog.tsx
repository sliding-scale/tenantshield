"use client"

import { useRouter } from "next/navigation"
import { BrandedAlertDialog } from "@/components/ui/branded-alert-dialog"

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
    <BrandedAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      eyebrow={eyebrow}
      eyebrowVariant="primary"
      iconVariant="warning"
      cancelLabel="Not now"
      actionLabel={primaryActionLabel}
      actionVariant="surface-strong"
      onAction={() => router.push(primaryActionHref)}
    />
  )
}
