"use client"

import { useCallback, useState } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { SelectPaidPlanInput } from "@/lib/plans/pricing"

/**
 * Starts Stripe Checkout for a paid plan — Convex `stripe.node.createCheckoutSession`.
 * User returns to `/dashboard` on success; cancel URL depends on `checkoutSource`.
 */
export function useSelectPaidPlan() {
  const checkoutAction = useAction(api.stripe.node.createCheckoutSession)
  const [isSelecting, setIsSelecting] = useState(false)

  const selectPaidPlan = useCallback(
    async (input: SelectPaidPlanInput) => {
      setIsSelecting(true)
      try {
        const { url } = await checkoutAction({
          plan: input.plan,
          planType: input.planType,
          checkoutSource: input.checkoutSource,
        })
        window.location.assign(url)
      } finally {
        setIsSelecting(false)
      }
    },
    [checkoutAction],
  )

  return { selectPaidPlan, isSelecting }
}
