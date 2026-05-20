"use client"

import { UserRound, Star } from "lucide-react"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { Card } from "@/components/ui/card"
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
              : "size-3.5 fill-transparent text-muted-foreground/40"
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
    <Card
      className={cn(
        "gap-0 rounded-3xl border border-border py-0 shadow-none ring-0",
        className,
      )}
    >
      <div className="flex w-full min-w-0 items-baseline justify-between gap-2 border-b border-border px-4 py-4 sm:px-5">
        <h2 className="font-heading text-lg font-semibold text-foreground sm:text-xl">
          {heading}
        </h2>
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">
          {isLoading ? "…" : `${count} review${count === 1 ? "" : "s"}`}
        </span>
      </div>

      {isLoading ? (
        <ul className="space-y-3 p-4 sm:p-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <li
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-border bg-accent"
            />
          ))}
        </ul>
      ) : count === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-5 sm:py-12">
          {emptyMessage}
        </p>
      ) : (
        <FadeInStagger className="divide-y divide-border">
          {ratings!.map((rating) => {
            const issueTags = issueTypesForDisplay(rating)
            const breakdown: ReviewBreakdown = {
              responsiveness: rating.scores.responsiveness,
              honesty: rating.scores.honesty,
              depositFairness: rating.scores.depositFairness,
              repairSpeed: rating.scores.repairSpeed,
            }
            return (
              <FadeIn key={rating._id} stagger>
                <article className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                        <UserRound className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">Anonymous Tenant</p>
                        {rating.landlordName ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Landlord / manager:{" "}
                            <span className="font-semibold text-foreground">
                              {rating.landlordName}
                            </span>
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
                        <p className="text-xs font-medium text-muted-foreground">Issue types</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {issueTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Category ratings</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {(Object.entries(breakdown) as [RatingCategoryId, number][]).map(
                          ([key, val]) => (
                            <span
                              key={key}
                              className="rounded-full border border-border bg-accent px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {BREAKDOWN_LABELS[key]}: {val}/5
                            </span>
                          ),
                        )}
                        <span className="rounded-full border border-border bg-accent px-2 py-0.5 text-xs font-semibold text-foreground">
                          Overall: {rating.scores.overall}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {rating.experience ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-6">
                      {rating.experience}
                    </p>
                  ) : null}
                </article>
              </FadeIn>
            )
          })}
        </FadeInStagger>
      )}
    </Card>
  )
}
