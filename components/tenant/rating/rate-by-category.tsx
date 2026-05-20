"use client"

import { useId } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ISSUE_TYPES, type IssueTypeValue } from "@/lib/constants/issue-types"

export const RATING_CATEGORY_ROWS = [
  { id: "responsiveness", label: "Responsiveness" },
  { id: "honesty", label: "Honesty" },
  { id: "depositFairness", label: "Deposit Fairness" },
  { id: "repairSpeed", label: "Repair Speed" },
  { id: "overall", label: "Overall" },
] as const

export type RatingCategoryId = (typeof RATING_CATEGORY_ROWS)[number]["id"]

export type RatingCategoryScores = Record<RatingCategoryId, number | null>

export const emptyCategoryScores = (): RatingCategoryScores => ({
  responsiveness: null,
  honesty: null,
  depositFairness: null,
  repairSpeed: null,
  overall: null,
})

export const RATING_EXPERIENCE_MAX_LENGTH = 500

const STAR_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Okay",
  4: "Good",
  5: "Excellent",
}

type Props = {
  selectedIssueTypes: IssueTypeValue[]
  onToggleIssueType: (value: IssueTypeValue) => void
  issueTypesError?: boolean
  scores: RatingCategoryScores
  onScoreChange: (id: RatingCategoryId, value: number) => void
  landlordName: string
  onLandlordNameChange: (value: string) => void
  landlordNameError?: boolean
  experience: string
  onExperienceChange: (value: string) => void
  maxExperienceLength?: number
  className?: string
}

export function RateByCategory({
  selectedIssueTypes,
  onToggleIssueType,
  issueTypesError,
  scores,
  onScoreChange,
  landlordName,
  onLandlordNameChange,
  landlordNameError,
  experience,
  onExperienceChange,
  maxExperienceLength = RATING_EXPERIENCE_MAX_LENGTH,
  className,
}: Props) {
  const groupLabelId = useId()
  const landlordId = useId()
  const experienceId = useId()
  const experienceLen = experience.length

  return (
    <Card
      className={cn(
        "w-full min-w-0 max-w-full gap-0 rounded-3xl border border-border py-0 shadow-none ring-0",
        className,
      )}
    >
      <div className="space-y-6 p-4 sm:p-5 md:p-6">
        <section role="group" aria-labelledby={groupLabelId}>
          <h2 className="font-heading text-lg font-semibold text-foreground">Issue types</h2>
          <p id={groupLabelId} className="mt-1 text-sm text-muted-foreground">
            Select all that apply <span className="text-destructive">*</span>
          </p>
          <ul
            className={cn(
              "mt-3 max-h-[min(22rem,50vh)] space-y-1 overflow-y-auto rounded-2xl border bg-background p-2 sm:p-2.5",
              issueTypesError ? "border-destructive" : "border-border",
            )}
          >
            {ISSUE_TYPES.map((t) => {
              const checked = selectedIssueTypes.includes(t.value)
              return (
                <li key={t.value}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 transition sm:px-3",
                      checked ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleIssueType(t.value)}
                      className="mt-1 size-4 shrink-0 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                    />
                    <span className="min-w-0 text-sm leading-snug text-foreground">
                      <span className="font-medium">{t.value}</span>
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        {t.subtitle}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          {issueTypesError ? (
            <p className="mt-2 text-xs text-destructive">Select at least one issue type.</p>
          ) : null}
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">Rate by category</h2>
          <ul className="mt-4 w-full min-w-0 space-y-5">
            {RATING_CATEGORY_ROWS.map((row) => {
              const value = scores[row.id]
              return (
                <li key={row.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-foreground">{row.label}</span>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <div className="flex gap-0.5" role="group" aria-label={`${row.label} rating`}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const active = value !== null && star <= value
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => onScoreChange(row.id, star)}
                              className="rounded-md p-0.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                              aria-label={`${row.label} ${star} out of 5`}
                              aria-pressed={value === star}
                            >
                              <Star
                                className={cn(
                                  "size-7 sm:size-8",
                                  active
                                    ? "fill-primary text-primary"
                                    : "fill-transparent text-muted-foreground/40",
                                )}
                                strokeWidth={active ? 0 : 1.25}
                              />
                            </button>
                          )
                        })}
                      </div>
                      {value !== null ? (
                        <span className="text-xs font-medium tabular-nums text-muted-foreground sm:text-sm">
                          {value}/5 — {STAR_LABELS[value]}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Tap stars to rate</span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">Landlord details</h2>
          <div className="mt-4">
            <Label htmlFor={landlordId} className="text-sm font-medium text-foreground">
              Landlord / property manager <span className="text-destructive">*</span>
            </Label>
            <Input
              id={landlordId}
              required
              value={landlordName}
              onChange={(e) => onLandlordNameChange(e.target.value.slice(0, 120))}
              placeholder="e.g. J. Davis Properties"
              maxLength={120}
              aria-invalid={landlordNameError || undefined}
              className={cn(
                "mt-1.5 h-11 rounded-xl border-border bg-background",
                landlordNameError && "border-destructive",
              )}
            />
            {landlordNameError ? (
              <p className="mt-1 text-xs text-destructive">
                Please enter the landlord or property manager&apos;s name.
              </p>
            ) : null}
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">Your experience</h2>
          <p className="mt-1 text-sm text-muted-foreground">Optional — share what living here was like.</p>
          <div className="mt-4 w-full min-w-0">
            <Label htmlFor={experienceId} className="sr-only">
              Your experience
            </Label>
            <textarea
              id={experienceId}
              value={experience}
              onChange={(e) => onExperienceChange(e.target.value.slice(0, maxExperienceLength))}
              rows={5}
              maxLength={maxExperienceLength}
              placeholder="Share what it was actually like living here..."
              className="w-full min-w-0 resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {experienceLen} / {maxExperienceLength}
            </p>
          </div>
        </section>
      </div>
    </Card>
  )
}
