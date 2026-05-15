"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAction, useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import {
  DEFAULT_ISSUE_TYPE,
  isIssueTypeValue,
  type IssueTypeValue,
} from "@/lib/constants/issue-types"
import { filterUSStates, type USStateAbbr } from "@/lib/constants/us-states"
import { usePrefilledUSState } from "@/app/hooks/usePrefilledUSState"
import { NewLetterForm } from "../../../../components/tenant/write-letter/new-letter-form"

export default function WriteLettersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clerkUser } = useCurrentUser()
  const generateLetter = useAction(api.letters.actions.generateTenantLetter)
  const stateChipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const caseIdParam = searchParams.get("caseId")?.trim() ?? ""
  const caseId = caseIdParam ? (caseIdParam as Id<"cases">) : undefined
  const attachedLetterId = useQuery(
    api.letters.queries.getLetterIdByCaseForCurrentUser,
    caseId ? { caseId } : "skip",
  )
  const { state, setState } = usePrefilledUSState(searchParams.get("state"))
  const [letterType, setLetterType] = useState<IssueTypeValue>(DEFAULT_ISSUE_TYPE)
  const [stateSearch, setStateSearch] = useState("")
  const [fullName, setFullName] = useState("")
  const [landlordName, setLandlordName] = useState("")
  const [propertyAddress, setPropertyAddress] = useState("")
  const [senderAddress, setSenderAddress] = useState("")
  const [landlordAddress, setLandlordAddress] = useState("")
  const [description, setDescription] = useState("")
  const [amountAtStake, setAmountAtStake] = useState("")
  const [deadlineDays, setDeadlineDays] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const inferredName = useMemo(() => {
    const parts = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean)
    return parts.join(" ").trim()
  }, [clerkUser?.firstName, clerkUser?.lastName])

  const filteredStates = useMemo(() => filterUSStates(stateSearch), [stateSearch])

  const chipsToShow = useMemo(() => {
    if (!state) return filteredStates
    const sel = state as USStateAbbr
    if (filteredStates.includes(sel)) return filteredStates
    return [sel, ...filteredStates]
  }, [filteredStates, state])

  useEffect(() => {
    if (!fullName && inferredName) {
      setFullName(inferredName)
    }
  }, [inferredName, fullName])

  useEffect(() => {
    const prefillIssueType = searchParams.get("issueType")?.trim() ?? ""
    if (prefillIssueType && isIssueTypeValue(prefillIssueType)) {
      setLetterType(prefillIssueType)
    }
  }, [searchParams])

  useEffect(() => {
    const prefillIssue = searchParams.get("issue")?.trim() ?? ""
    const prefillLandlord = searchParams.get("landlord")?.trim() ?? ""
    const prefillPropertyAddress = searchParams.get("propertyAddress")?.trim() ?? ""

    if (!description && prefillIssue) {
      setDescription(prefillIssue)
    }
    if (!landlordName && prefillLandlord) {
      setLandlordName(prefillLandlord)
    }
    if (!propertyAddress && prefillPropertyAddress) {
      setPropertyAddress(prefillPropertyAddress)
    }
  }, [description, landlordName, propertyAddress, searchParams])

  useEffect(() => {
    const el = stateChipRefs.current.get(state)
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [state])

  const selectionHiddenBySearch =
    Boolean(state) &&
    stateSearch.trim().length > 0 &&
    !filteredStates.includes(state as USStateAbbr)

  const caseAlreadyHasLetter = Boolean(caseId && attachedLetterId)

  const canSubmit = Boolean(
    letterType &&
      state &&
      fullName.trim() &&
      landlordName.trim() &&
      propertyAddress.trim() &&
      senderAddress.trim() &&
      landlordAddress.trim() &&
      description.trim() &&
      deadlineDays.trim() &&
      !isSubmitting &&
      !caseAlreadyHasLetter,
  )
  const onSubmit = async () => {
    if (!canSubmit) return
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      const result = await generateLetter({
        letterType,
        state,
        fullName: fullName.trim(),
        landlordName: landlordName.trim(),
        propertyAddress: propertyAddress.trim(),
        senderAddress: senderAddress.trim(),
        landlordAddress: landlordAddress.trim(),
        description: description.trim(),
        amountAtStake: amountAtStake.trim() || undefined,
        deadlineDays: deadlineDays.trim(),
        ...(caseId ? { caseId } : {}),
      })
      console.log("generateTenantLetter response", result)
      router.push(`/letters/${result.letterId}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to generate letter"
      setError(message)
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const caseLetterBanner =
    caseId && attachedLetterId ? (
      <div className="mb-4 rounded-2xl border border-cream-border bg-cream-surface-deep px-4 py-3 text-sm text-foreground">
        This case already has a letter.{" "}
        <Link href={`/letters/${attachedLetterId}`} className="font-semibold text-primary hover:underline">
          View attached letter
        </Link>
      </div>
    ) : null

  return (
    <>
      {caseLetterBanner}
      <NewLetterForm
      letterType={letterType}
      setLetterType={setLetterType}
      state={state}
      setState={setState}
      stateSearch={stateSearch}
      setStateSearch={setStateSearch}
      chipsToShow={chipsToShow}
      selectionHiddenBySearch={selectionHiddenBySearch}
      filteredStatesCount={filteredStates.length}
      fullName={fullName}
      setFullName={setFullName}
      landlordName={landlordName}
      setLandlordName={setLandlordName}
      propertyAddress={propertyAddress}
      setPropertyAddress={setPropertyAddress}
      senderAddress={senderAddress}
      setSenderAddress={setSenderAddress}
      landlordAddress={landlordAddress}
      setLandlordAddress={setLandlordAddress}
      description={description}
      setDescription={setDescription}
      amountAtStake={amountAtStake}
      setAmountAtStake={setAmountAtStake}
      deadlineDays={deadlineDays}
      setDeadlineDays={setDeadlineDays}
      error={error}
      success={success}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      onSubmit={() => void onSubmit()}
      onClose={() => router.back()}
      stateChipRefs={stateChipRefs}
    />
    </>
  )
}