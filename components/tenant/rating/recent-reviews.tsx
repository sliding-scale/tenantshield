"use client"

import { UserRound, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Doc } from "@/convex/_generated/dataModel"
import type { RatingCategoryId } from "./rate-by-category"

type ReviewBreakdown = Partial<Record<RatingCategoryId, number>>

const BREAKDOWN_LABELS: Record<RatingCategoryId, string> = {
  responsiveness: "Responsiveness",
  honesty: "Honesty",
  depositFairness: "Deposit Fairness",
  repairSpeed: "Repair Speed",
  overall: "Overall",
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
})

function formatDateLabel(timestamp: number) {
  return DATE_FORMATTER.format(new Date(timestamp))
}

function StarsDisplay({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={
            i <= rounded
              ? "size-3.5 fill-primary text-primary"
              : "size-3.5 fill-transparent text-muted"
          }
          strokeWidth={i <= rounded ? 0 : 1}
        />
      ))}
    </div>
  )
}

type RatingRow = Doc<"ratings"> & { issueTypes?: string[] }

function issueTypesForDisplay(rating: RatingRow): string[] {
  return rating.issueTypes ?? []
}

type Props = {
  ratings: RatingRow[] | undefined
  heading?: string
  className?: string
  emptyMessage?: string
}

export function RecentReviews({
  ratings,
  heading = "Recent reviews",
  className,
  emptyMessage = "No reviews yet — be the first to leave one.",
}: Props) {
  const isLoading = ratings === undefined
  const count = ratings?.length ?? 0

  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-full rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-5 md:p-6 lg:max-w-none",
        className,
      )}
    >
      <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground md:text-xs">
          {heading}
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {isLoading ? "…" : `${count} review${count === 1 ? "" : "s"}`}
        </span>
      </div>

      {isLoading ? (
        <ul className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <li
              key={i}
              className="h-28 animate-pulse rounded-xl border border-border bg-accent/60"
            />
          ))}
        </ul>
      ) : count === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-accent/40 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-4 w-full min-w-0 space-y-3">
          {ratings!.map((rating) => {
            const issueTags = issueTypesForDisplay(rating)
            const breakdown: ReviewBreakdown = {
              responsiveness: rating.scores.responsiveness,
              honesty: rating.scores.honesty,
              depositFairness: rating.scores.depositFairness,
              repairSpeed: rating.scores.repairSpeed,
            }
            return (
              <li
                key={rating._id}
                className="rounded-xl border border-border bg-accent/60 p-3.5 sm:p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/35 text-muted-foreground">
                      <UserRound className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Anonymous Tenant</p>
                      {rating.landlordName ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Landlord / manager:{" "}
                          <span className="font-semibold text-foreground">{rating.landlordName}</span>
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {formatDateLabel(rating.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StarsDisplay value={rating.scores.overall} />
                </div>

                <div className="mt-3 space-y-3">
                  {issueTags.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-xs">
                        Issue types
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {issueTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-accent px-2.5 py-0.5 text-[10px] font-medium text-foreground md:text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-xs">
                      Category ratings
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(Object.entries(breakdown) as [RatingCategoryId, number][]).map(
                        ([key, val]) => (
                          <span
                            key={key}
                            className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:text-xs"
                          >
                            {BREAKDOWN_LABELS[key]}: {val}/5
                          </span>
                        ),
                      )}
                      <span className="rounded-full border border-border bg-muted/25 px-2 py-0.5 text-[10px] font-semibold text-foreground md:text-xs">
                        Overall: {rating.scores.overall}/5
                      </span>
                    </div>
                  </div>
                </div>

                {rating.experience ? (
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground line-clamp-6">
                    {rating.experience}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
