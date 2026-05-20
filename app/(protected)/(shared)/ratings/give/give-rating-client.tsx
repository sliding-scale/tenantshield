"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Shield } from "lucide-react"
import { FadeIn } from "@/components/shared/fade-in"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AlreadyRatedProperty } from "@/components/tenant/rating/already-rated-property"
import {
  RateByCategory,
  emptyCategoryScores,
  type RatingCategoryId,
  type RatingCategoryScores,
} from "@/components/tenant/rating/rate-by-category"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { IssueTypeValue } from "@/lib/constants/issue-types"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

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
    existingRating !== undefined &&
    existingRating !== null &&
    property !== undefined &&
    property !== null

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
    if (selectedIssueTypes.length === 0 || !allCategoriesRated(scores) || !landlordName.trim()) {
      return
    }

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

  const headerTitle = alreadyRated ? "Your review" : "Rate property"

  return (
    <main
      className={cn(
        "min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full min-w-0 max-w-2xl">
        <header className="mb-6 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 md:mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(backHref)}
            className="h-11 w-11 rounded-full border-border bg-card p-0 text-foreground"
            aria-label={propertyIdRaw ? "Back to property" : "Back to ratings"}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
          <p className="truncate text-center text-base font-semibold text-foreground">
            {headerTitle}
          </p>
          <span className="w-11 shrink-0" aria-hidden />
        </header>

        <FadeIn>
          <div className="mb-6 md:mb-8">
            <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
              {alreadyRated ? "Your review" : "Rate this property"}
            </h1>
            {property === undefined && propertyIdRaw ? (
              <div className="mt-4 flex justify-start">
                <ShieldLoader variant="property" embedded />
              </div>
            ) : null}
            {property ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground md:text-base">
                {property.name}
              </p>
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
            {!alreadyRated && property ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Your identity is never revealed to landlords or the public.
              </p>
            ) : null}
          </div>

          {checkingExisting ? (
            <Card className="flex min-h-48 items-center justify-center gap-0 rounded-3xl border border-border py-0 shadow-none ring-0">
              <ShieldLoader variant="ratings" embedded label="Checking your\nreviews…" />
            </Card>
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

              <Card className="gap-0 rounded-2xl border border-border bg-accent py-0 shadow-none ring-0">
                <p className="flex items-start gap-2.5 px-4 py-3.5 text-sm leading-relaxed text-foreground sm:px-5">
                  <Shield
                    className="mt-0.5 size-4 shrink-0 text-secondary"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span>
                    Reviews are anonymous. We never show your name or contact details to landlords
                    or the public.
                  </span>
                </p>
              </Card>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="cta"
                  disabled={isSubmitting || missingProperty || property === null}
                  className="h-12 w-full rounded-xl text-base font-semibold sm:h-14 sm:text-lg"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <ShieldLoader variant="ratings" compact />
                      Submitting…
                    </span>
                  ) : (
                    "Submit review"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 text-muted-foreground hover:text-foreground"
                  onClick={() => router.push(backHref)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </FadeIn>
      </div>
    </main>
  )
}
