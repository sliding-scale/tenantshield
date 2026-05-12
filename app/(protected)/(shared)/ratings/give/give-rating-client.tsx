"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Loader2, Shield } from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import type { IssueTypeValue } from "@/lib/constants/issue-types"
import {
  RateByCategory,
  emptyCategoryScores,
  type RatingCategoryId,
  type RatingCategoryScores,
} from "@/components/tenant/rating/rate-by-category"
import { AlreadyRatedProperty } from "@/components/tenant/rating/already-rated-property"

const RATED_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
})

function allCategoriesRated(scores: RatingCategoryScores) {
  return (Object.values(scores) as (number | null)[]).every((v) => v !== null)
}

export default function GiveRatingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyIdRaw = searchParams.get("propertyId")?.trim() ?? ""
  const propertyId = propertyIdRaw as Id<"properties">

  const property = useQuery(
    api.properties.queries.getById,
    propertyIdRaw ? { id: propertyId } : "skip",
  )
  const existingRating = useQuery(
    api.ratings.queries.currentUserRatingForProperty,
    propertyIdRaw && property !== undefined && property !== null
      ? { propertyId }
      : "skip",
  )
  const createRating = useMutation(api.ratings.mutations.create)

  const backHref = propertyIdRaw ? `/ratings/${propertyIdRaw}` : "/ratings"
  const backLabel = propertyIdRaw ? "Back to property" : "Back to all ratings"

  const [selectedIssueTypes, setSelectedIssueTypes] = useState<IssueTypeValue[]>([])
  const [scores, setScores] = useState<RatingCategoryScores>(emptyCategoryScores())
  const [landlordName, setLandlordName] = useState("")
  const [experience, setExperience] = useState("")
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const issueTypesInvalid = attemptedSubmit && selectedIssueTypes.length === 0
  const categoriesInvalid = attemptedSubmit && !allCategoriesRated(scores)

  const toggleIssueType = (value: IssueTypeValue) => {
    setSelectedIssueTypes((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    )
  }
  const landlordNameInvalid = attemptedSubmit && !landlordName.trim()
  const missingProperty = !propertyIdRaw

  const checkingExisting =
    !!propertyIdRaw && property !== undefined && property !== null && existingRating === undefined
  const alreadyRated =
    existingRating !== undefined && existingRating !== null && property !== undefined && property !== null

  const handleScoreChange = (id: RatingCategoryId, value: number) => {
    setScores((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttemptedSubmit(true)
    setSubmitError(null)

    if (!propertyIdRaw) {
      setSubmitError("Pick a property first.")
      return
    }
    if (selectedIssueTypes.length === 0 || !allCategoriesRated(scores) || !landlordName.trim()) return

    setIsSubmitting(true)
    try {
      await createRating({
        propertyId,
        issueTypes: selectedIssueTypes,
        scores: {
          responsiveness: scores.responsiveness ?? 0,
          honesty: scores.honesty ?? 0,
          depositFairness: scores.depositFairness ?? 0,
          repairSpeed: scores.repairSpeed ?? 0,
          overall: scores.overall ?? 0,
        },
        landlordName: landlordName.trim(),
        experience: experience.trim() || undefined,
      })
      router.replace(`/ratings/${propertyIdRaw}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit your rating."
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-5 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-8">
      <div className="mx-auto w-full min-w-0 max-w-screen-2xl">
        <Button
          variant="outline"
          size="sm"
          className="mb-5 gap-1 rounded-full border-cream-border bg-background"
          asChild
        >
          <Link href={backHref}>
            <ChevronLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>

        <header className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary md:text-xs">
            Anonymous review
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold leading-snug text-ink-warm md:text-3xl lg:text-[2rem]">
            {alreadyRated ? "Your review" : "Rate this property"}
          </h1>
          {property === undefined && propertyIdRaw ? (
            <p className="mt-2 text-sm text-ink-warm-muted">Loading property…</p>
          ) : null}
          {property ? (
            <p className="mt-2 text-base font-medium text-ink-warm md:text-lg">{property.name}</p>
          ) : null}
          {property === null ? (
            <p className="mt-2 text-sm text-destructive">
              We couldn&apos;t find that property. Please return to{" "}
              <Link href="/ratings" className="underline">
                all properties
              </Link>
              .
            </p>
          ) : null}
          {!alreadyRated ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-ink-warm-muted">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <Shield className="size-4 shrink-0" strokeWidth={1.75} />
              </span>
              Your identity is never revealed.
            </p>
          ) : null}
        </header>

        {checkingExisting ? (
          <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-cream-border bg-cream-surface/40 px-4 py-10">
            <p className="text-sm text-ink-warm-muted">Checking your reviews…</p>
          </div>
        ) : null}

        {alreadyRated && property ? (
          <AlreadyRatedProperty
            propertyName={property.name}
            propertyHref={`/ratings/${propertyIdRaw}`}
            overallScore={existingRating.scores.overall}
            ratedAtLabel={RATED_DATE_FORMAT.format(new Date(existingRating.createdAt))}
          />
        ) : null}

        {!checkingExisting && !alreadyRated ? (
        <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
          <RateByCategory
            selectedIssueTypes={selectedIssueTypes}
            onToggleIssueType={toggleIssueType}
            issueTypesError={issueTypesInvalid}
            scores={scores}
            onScoreChange={handleScoreChange}
            landlordName={landlordName}
            onLandlordNameChange={setLandlordName}
            landlordNameError={landlordNameInvalid}
            experience={experience}
            onExperienceChange={setExperience}
          />

          {categoriesInvalid ? (
            <p className="text-sm text-destructive">
              Please rate every category before submitting.
            </p>
          ) : null}
          {submitError ? (
            <p className="text-sm font-medium text-destructive">{submitError}</p>
          ) : null}

          <div className="rounded-xl border border-secondary/25 bg-secondary/10 px-3 py-3 sm:px-4 sm:py-3.5">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-warm">
              <Shield className="mt-0.5 size-4 shrink-0 text-secondary" strokeWidth={1.75} />
              <span>
                Reviews are anonymous. We never show your name or contact details to landlords or
                the public.
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <Button
              type="submit"
              disabled={isSubmitting || missingProperty || property === null}
              className="h-12 w-full rounded-xl border-0 bg-surface-strong text-base font-semibold text-white shadow-md hover:bg-surface-strong-hover disabled:bg-cream-surface-deep disabled:text-ink-warm-muted disabled:opacity-100 sm:h-14 sm:text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit review"
              )}
            </Button>
            <Link
              href={backHref}
              className="text-center text-sm font-medium text-ink-warm-muted underline-offset-4 hover:text-ink-warm hover:underline"
            >
              Cancel
            </Link>
          </div>
        </form>
        ) : null}
      </div>
    </main>
  )
}
