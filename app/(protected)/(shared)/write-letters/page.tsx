"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAction, useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { NewLetterForm } from "@/components/tenant/write-letter/new-letter-form"
import {
  DEFAULT_ISSUE_TYPE,
  isIssueTypeValue,
  type IssueTypeValue,
} from "@/lib/constants/issue-types"
import { usePrefilledUSState } from "@/app/hooks/usePrefilledUSState"

export default function WriteLettersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clerkUser } = useCurrentUser()
  const generateLetter = useAction(api.letters.actions.generateTenantLetter)
  const caseIdParam = searchParams.get("caseId")?.trim() ?? ""
  const caseId = caseIdParam ? (caseIdParam as Id<"cases">) : undefined
  const attachedLetterId = useQuery(
    api.letters.queries.getLetterIdByCaseForCurrentUser,
    caseId ? { caseId } : "skip",
  )
  const { state, setState, isProfileStateLoading } = usePrefilledUSState(searchParams.get("state"))
  const [letterType, setLetterType] = useState<IssueTypeValue>(DEFAULT_ISSUE_TYPE)
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

  const caseAlreadyHasLetter = Boolean(caseId && attachedLetterId)
  const isCheckingAttachedLetter = Boolean(caseId && attachedLetterId === undefined)

  useEffect(() => {
    if (!caseId || !attachedLetterId) return
    router.replace(`/letters/${attachedLetterId}`)
  }, [caseId, attachedLetterId, router])

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
    let navigated = false
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
      navigated = true
      router.replace(`/letters/${result.letterId}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to generate letter"
      if (
        caseId &&
        attachedLetterId &&
        /already has a letter/i.test(message)
      ) {
        navigated = true
        router.replace(`/letters/${attachedLetterId}`)
        return
      }
      setError(message)
      console.error(e)
    } finally {
      if (!navigated) {
        setIsSubmitting(false)
      }
    }
  }

  const showLetterLoader =
    isSubmitting || caseAlreadyHasLetter || isCheckingAttachedLetter

  return (
    <NewLetterForm
      letterType={letterType}
      setLetterType={setLetterType}
      state={state}
      setState={setState}
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
      isSubmitting={showLetterLoader}
      isStateReady={!isProfileStateLoading}
      onSubmit={() => void onSubmit()}
    />
  )
}
