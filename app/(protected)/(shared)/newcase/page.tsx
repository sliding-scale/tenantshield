"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
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
import { filterUSStates, type USStateAbbr } from "@/lib/constants/us-states"
import type { PlanId } from "@/lib/plans/plan-access"

export default function NewCasePage() {
  const router = useRouter()
  const analyzeCase = useAction(api.cases.actions.analyzeNewCase)
  const stateChipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const [issueType, setIssueType] = useState<string>(DEFAULT_ISSUE_TYPE)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [state, setState] = useState<string>("")
  const [stateSearch, setStateSearch] = useState("")
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

  const filteredStates = useMemo(() => filterUSStates(stateSearch), [stateSearch])

  const chipsToShow = useMemo(() => {
    if (!state) return filteredStates
    const sel = state as USStateAbbr
    if (filteredStates.includes(sel)) return filteredStates
    return [sel, ...filteredStates]
  }, [filteredStates, state])

  useEffect(() => {
    const el = stateChipRefs.current.get(state)
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [state])

  const selectionHiddenBySearch =
    Boolean(state) &&
    stateSearch.trim().length > 0 &&
    !filteredStates.includes(state as USStateAbbr)

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
      console.log("analyzeNewCase response", result)
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
      stateSearch={stateSearch}
      setStateSearch={setStateSearch}
      chipsToShow={chipsToShow}
      selectionHiddenBySearch={selectionHiddenBySearch}
      filteredStatesCount={filteredStates.length}
      city={city}
      setCity={setCity}
      landlord={landlord}
      setLandlord={setLandlord}
      propertyAddress={propertyAddress}
      setPropertyAddress={setPropertyAddress}
      error={error}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      onSubmit={() => void onSubmit()}
      onClose={() => router.back()}
      stateChipRefs={stateChipRefs}
    />
  )
}
