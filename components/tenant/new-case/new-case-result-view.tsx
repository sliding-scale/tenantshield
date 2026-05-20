"use client"

import { type Id } from "@/convex/_generated/dataModel"
import {
  NewCaseAnalysisResult,
  type CaseAnalysis,
  type NewCaseDetailsSnapshot,
} from "@/components/case/new-case-analysis-result"
import type { PlanId } from "@/lib/plans/plan-access"

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
    <main className="flex min-h-svh flex-col bg-background pb-28 pt-5 md:min-h-svh md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
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

