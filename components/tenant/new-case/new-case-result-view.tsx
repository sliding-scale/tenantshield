"use client"

import { type Id } from "@/convex/_generated/dataModel"
import {
  NewCaseAnalysisResult,
  type CaseAnalysis,
  type NewCaseDetailsSnapshot,
} from "@/components/case/new-case-analysis-result"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import type { PlanId } from "@/lib/plans/plan-access"
import { cn } from "@/lib/utils"

type NewCaseResultViewProps = {
  result: {
    caseId: Id<"cases">
    aiAnalysis: CaseAnalysis
    details: NewCaseDetailsSnapshot
    createdUnderPlan?: PlanId | null
  }
  onBack: () => void
}

export function NewCaseResultView({ result, onBack }: NewCaseResultViewProps) {
  return (
    <main
      className={cn(
        "flex min-h-[100dvh] min-w-0 flex-col overflow-x-hidden bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="flex w-full min-w-0 flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <NewCaseAnalysisResult
          details={result.details}
          aiAnalysis={result.aiAnalysis}
          createdUnderPlan={result.createdUnderPlan}
          caseId={result.caseId}
          onBack={onBack}
        />
      </div>
    </main>
  )
}
