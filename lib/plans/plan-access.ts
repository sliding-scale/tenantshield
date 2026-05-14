import { type PlanId } from "@/lib/plans/plans"

export type { PlanId }

export function resolvePlanId(plan: PlanId | null | undefined): PlanId {
  return plan ?? "free"
}

export function planDisplayLabel(plan: PlanId | null | undefined): string {
  switch (resolvePlanId(plan)) {
    case "free":
      return "Free"
    case "pro":
      return "Pro"
    case "power":
      return "Power"
  }
}

export function shouldBlurFreeCaseAnalysis(createdUnderPlan: PlanId | null | undefined) {
  return createdUnderPlan === "free"
}

export function shouldBlurFreeLetterPreview(createdUnderPlan: PlanId | null | undefined) {
  return createdUnderPlan === "free"
}

export function shouldPromptFreePlanUpgrade(
  userPlan: PlanId | null | undefined,
  generatedCount: number,
) {
  return resolvePlanId(userPlan) === "free" && generatedCount > 0
}
