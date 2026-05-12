"use client"

import { useId } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
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
    <div
      className={cn(
        "w-full min-w-0 max-w-full rounded-2xl border border-cream-border bg-background p-4 shadow-sm sm:p-5 md:p-6 lg:max-w-none",
        className,
      )}
    >
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary md:text-xs">
        Rate by category
      </h2>
      <div className="mt-4" role="group" aria-labelledby={groupLabelId}>
        <p id={groupLabelId} className="text-sm font-medium text-ink-warm">
          Issue types <span className="text-destructive">*</span>
        </p>
        <p className="mt-1 text-xs text-ink-warm-muted">Select all that apply.</p>
        <ul
          className={cn(
            "mt-3 max-h-[min(22rem,50vh)] space-y-2 overflow-y-auto rounded-xl border p-2 sm:p-3",
            issueTypesError ? "border-destructive" : "border-cream-border",
          )}
        >
          {ISSUE_TYPES.map((t) => {
            const checked = selectedIssueTypes.includes(t.value)
            return (
              <li key={t.value}>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition sm:px-3",
                    checked ? "bg-primary/10" : "hover:bg-cream-surface-soft",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleIssueType(t.value)}
                    className="mt-1 size-4 shrink-0 rounded border-cream-border text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                  <span className="min-w-0 text-sm leading-snug text-ink-warm">
                    <span className="font-medium">{t.value}</span>
                    <span className="mt-0.5 block text-xs font-normal text-ink-warm-muted">
                      {t.subtitle}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        {issueTypesError ? (
          <p className="mt-2 text-xs text-destructive">
            Select at least one issue type.
          </p>
        ) : null}
      </div>

      <ul className="mt-6 w-full min-w-0 space-y-6">
        {RATING_CATEGORY_ROWS.map((row) => {
          const value = scores[row.id]
          return (
            <li key={row.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-ink-warm">{row.label}</span>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div className="flex gap-0.5" role="group" aria-label={`${row.label} rating`}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = value !== null && star <= value
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => onScoreChange(row.id, star)}
                          className="rounded-md p-0.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          aria-label={`${row.label} ${star} out of 5`}
                          aria-pressed={value === star}
                        >
                          <Star
                            className={cn(
                              "size-7 sm:size-8",
                              active
                                ? "fill-primary text-primary"
                                : "fill-transparent text-cream-surface-deep",
                            )}
                            strokeWidth={active ? 0 : 1.25}
                          />
                        </button>
                      )
                    })}
                  </div>
                  {value !== null ? (
                    <span className="text-xs font-medium tabular-nums text-ink-warm-muted sm:text-sm">
                      {value}/5 — {STAR_LABELS[value]}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-warm-muted">Tap stars to rate</span>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 border-t border-cream-border pt-8">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary md:text-xs">
          Landlord details
        </h2>
        <div className="mt-4">
          <label htmlFor={landlordId} className="text-sm font-medium text-ink-warm">
            Landlord / Property Manager Name <span className="text-destructive">*</span>
          </label>
          <Input
            id={landlordId}
            required
            value={landlordName}
            onChange={(e) => onLandlordNameChange(e.target.value.slice(0, 120))}
            placeholder="e.g. J. Davis Properties"
            maxLength={120}
            aria-invalid={landlordNameError || undefined}
            className={cn(
              "mt-1.5 h-11 w-full min-w-0 rounded-xl bg-cream-surface-soft px-3 text-sm text-ink-warm placeholder:text-ink-warm-muted",
              landlordNameError ? "border-destructive" : "border-cream-border border",
            )}
          />
          {landlordNameError ? (
            <p className="mt-1 text-xs text-destructive">
              Please enter the landlord or property manager&apos;s name.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 border-t border-cream-border pt-8">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary md:text-xs">
          Optional details
        </h2>
        <div className="mt-4 w-full min-w-0 space-y-4">
          <div>
            <label htmlFor={experienceId} className="text-sm font-medium text-ink-warm">
              Your experience
            </label>
            <textarea
              id={experienceId}
              value={experience}
              onChange={(e) => onExperienceChange(e.target.value.slice(0, maxExperienceLength))}
              rows={5}
              maxLength={maxExperienceLength}
              placeholder="Share what it was actually like living here..."
              className="mt-1.5 w-full min-w-0 resize-y rounded-xl border border-cream-border bg-cream-surface-soft px-3 py-2.5 text-sm text-ink-warm outline-none transition placeholder:text-ink-warm-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            <p className="mt-1 text-right text-xs text-ink-warm-muted">
              {experienceLen} / {maxExperienceLength}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
