"use client"

import { useCallback, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { SelectPaidPlanInput } from "@/lib/plans/pricing"

/**
 * Subscribes the current user to a paid plan — same Convex path as billing:
 * `planUsage.mutations.selectPlanForCurrentUser` (updates `users.plan` + `planUsage`).
 */
export function useSelectPaidPlan() {
  const selectPlanMutation = useMutation(api.planUsage.mutations.selectPlanForCurrentUser)
  const [isSelecting, setIsSelecting] = useState(false)

  const selectPaidPlan = useCallback(
    async (input: SelectPaidPlanInput) => {
      setIsSelecting(true)
      try {
        return await selectPlanMutation({
          plan: input.plan,
          planType: input.planType,
        })
      } finally {
        setIsSelecting(false)
      }
    },
    [selectPlanMutation],
  )

  return { selectPaidPlan, isSelecting }
}
