"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAction } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import {
  type CaseAnalysis,
  type NewCaseDetailsSnapshot,
} from "@/components/case/new-case-analysis-result"
import { NewCaseForm } from "@/components/tenant/new-case/new-case-form"
import { NewCaseResultView } from "@/components/tenant/new-case/new-case-result-view"
import { DEFAULT_ISSUE_TYPE } from "@/lib/constants/issue-types"
import type { PlanId } from "@/lib/plans/plan-access"
import { usePrefilledUSState } from "@/app/hooks/usePrefilledUSState"

export default function NewCasePage() {
  const searchParams = useSearchParams()
  const analyzeCase = useAction(api.cases.actions.analyzeNewCase)
  const { state, setState, isProfileStateLoading } = usePrefilledUSState(searchParams.get("state"))

  const [issueType, setIssueType] = useState<string>(DEFAULT_ISSUE_TYPE)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [city, setCity] = useState("")
  const [landlord, setLandlord] = useState("")
  const [propertyAddress, setPropertyAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
    caseId: Id<"cases">
    aiAnalysis: CaseAnalysis
    details: NewCaseDetailsSnapshot
    createdUnderPlan?: PlanId | null
  } | null>(null)

  const canSubmit = Boolean(issueType && title.trim() && description.trim() && state && !isSubmitting)

  const onSubmit = async () => {
    if (!canSubmit) return
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await analyzeCase({
        issueType,
        shortTitle: title.trim(),
        description: description.trim(),
        state,
        city: city.trim() || undefined,
        landlordName: landlord.trim() || undefined,
        propertyAddress: propertyAddress.trim() || undefined,
      })
      const details: NewCaseDetailsSnapshot = {
        issueType,
        title: title.trim(),
        description: description.trim(),
        state,
        city: city.trim(),
        landlord: landlord.trim(),
        propertyAddress: propertyAddress.trim(),
      }
      setAnalysisResult({
        caseId: result.caseId,
        aiAnalysis: result.aiAnalysis,
        details,
        createdUnderPlan: result.createdUnderPlan,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to analyze case"
      setError(message)
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (analysisResult) {
    return (
      <NewCaseResultView
        result={analysisResult}
        onBack={() => setAnalysisResult(null)}
      />
    )
  }

  return (
    <NewCaseForm
      issueType={issueType}
      setIssueType={setIssueType}
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      state={state}
      setState={setState}
      city={city}
      setCity={setCity}
      landlord={landlord}
      setLandlord={setLandlord}
      propertyAddress={propertyAddress}
      setPropertyAddress={setPropertyAddress}
      error={error}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      isStateReady={!isProfileStateLoading}
      onSubmit={() => void onSubmit()}
    />
  )
}
