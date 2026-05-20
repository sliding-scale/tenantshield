"use client"

import { type Id } from "@/convex/_generated/dataModel"
import {
  NewCaseAnalysisResult,
  type CaseAnalysis,
  type NewCaseDetailsSnapshot,
} from "@/components/case/new-case-analysis-result"
import {
  MOBILE_CASE_RESULT_SHELL_CLASS,
  MOBILE_PAGE_TOP_PADDING,
} from "@/lib/nav/mobile-chrome"
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
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background pt-5 md:min-h-[calc(100vh-4rem)] md:pt-6 lg:pt-8",
        MOBILE_PAGE_TOP_PADDING,
        MOBILE_CASE_RESULT_SHELL_CLASS,
      )}
    >
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
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
