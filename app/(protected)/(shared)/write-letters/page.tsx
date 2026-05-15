"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import {
  DEFAULT_ISSUE_TYPE,
  isIssueTypeValue,
  type IssueTypeValue,
} from "@/lib/constants/issue-types"
import { filterUSStates, US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"
import { NewLetterForm } from "../../../../components/tenant/write-letter/new-letter-form"

export default function WriteLettersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clerkUser } = useCurrentUser()
  const generateLetter = useAction(api.letters.actions.generateTenantLetter)
  const stateChipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [letterType, setLetterType] = useState<IssueTypeValue>(DEFAULT_ISSUE_TYPE)
  const [state, setState] = useState<string>("")
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
    const prefillState = searchParams.get("state")?.trim().toUpperCase() ?? ""
    const prefillIssue = searchParams.get("issue")?.trim() ?? ""
    const prefillLandlord = searchParams.get("landlord")?.trim() ?? ""
    const prefillPropertyAddress = searchParams.get("propertyAddress")?.trim() ?? ""

    if (!state && prefillState in US_STATE_NAMES) {
      setState(prefillState)
    }
    if (!description && prefillIssue) {
      setDescription(prefillIssue)
    }
    if (!landlordName && prefillLandlord) {
      setLandlordName(prefillLandlord)
    }
    if (!propertyAddress && prefillPropertyAddress) {
      setPropertyAddress(prefillPropertyAddress)
    }
  }, [description, landlordName, propertyAddress, searchParams, state])

  useEffect(() => {
    const el = stateChipRefs.current.get(state)
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [state])

  const selectionHiddenBySearch =
    Boolean(state) &&
    stateSearch.trim().length > 0 &&
    !filteredStates.includes(state as USStateAbbr)

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
      !isSubmitting,
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

  return (
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
  )
}