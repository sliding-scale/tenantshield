"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, MapPin, Star } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { FadeIn } from "@/components/shared/fade-in"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { PropertyCardImage } from "@/components/tenant/rating/property-card-image"
import { RecentReviews } from "@/components/tenant/rating/recent-reviews"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

export default function PropertyRatingsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const rawId = typeof params?.id === "string" ? params.id : ""
  const propertyId = rawId as Id<"properties">

  const property = useQuery(
    api.properties.queries.getById,
    rawId ? { id: propertyId } : "skip",
  )
  const ratings = useQuery(
    api.ratings.queries.listForProperty,
    rawId ? { propertyId } : "skip",
  )
  const summary = useQuery(
    api.ratings.queries.propertySummary,
    rawId ? { propertyId } : "skip",
  )

  if (property === undefined) {
    return <ShieldLoader variant="property" fullPage />
  }

  if (property === null) {
    return (
      <main
        className={cn(
          "min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10",
          MOBILE_TAB_BAR_PAGE_SHELL,
        )}
      >
        <div className="mx-auto w-full max-w-lg">
          <FadeIn>
            <Card className="gap-0 rounded-3xl border border-border py-0 text-center shadow-none ring-0">
              <div className="px-6 py-10 md:px-8 md:py-12">
                <h1 className="font-heading text-2xl font-semibold text-foreground">
                  Property not found
                </h1>
                <p className="mt-2 text-muted-foreground">
                  This listing may have been removed or the link is incorrect.
                </p>
                <Button variant="outline" className="mt-6 rounded-xl" asChild>
                  <Link href="/ratings">Back to all ratings</Link>
                </Button>
              </div>
            </Card>
          </FadeIn>
        </div>
      </main>
    )
  }

  const overall = summary?.averages?.overall
  const count = summary?.count ?? 0
  const issueTags = summary?.issueTypes ?? []
  const giveRatingHref = `/ratings/give?propertyId=${encodeURIComponent(property._id)}`

  return (
    <main
      className={cn(
        "min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-4 grid grid-cols-[2.75rem_1fr_auto] items-center gap-2 sm:gap-3 md:mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/ratings")}
            className="h-11 w-11 rounded-full border-border bg-card p-0 text-foreground"
            aria-label="Back to ratings"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
          <p className="truncate text-center text-sm font-semibold text-foreground sm:text-base">
            Property
          </p>
          <Button
            variant="cta"
            size="sm"
            className="h-9 shrink-0 gap-1.5 rounded-full px-3 sm:h-10 sm:px-4"
            asChild
          >
            <Link href={giveRatingHref}>
              <Star className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Give a rating</span>
              <span className="sm:hidden">Rate</span>
            </Link>
          </Button>
        </header>

        <FadeIn>
          <Card className="gap-0 overflow-hidden rounded-3xl border border-border py-0 shadow-none ring-0">
            <PropertyCardImage imageUrl={property.imageUrl} propertyId={property._id} />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="font-heading text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
                    {property.name}
                  </h1>
                  <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    {count === 0
                      ? "No reviews yet"
                      : `${count} review${count === 1 ? "" : "s"}`}
                  </p>
                </div>
                <p className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-sm font-semibold text-foreground">
                  <Star className="size-3.5 fill-primary text-primary" aria-hidden />
                  {overall !== undefined ? overall.toFixed(1) : "—"}
                </p>
              </div>

              {issueTags.length > 0 ? (
                <div className="mt-3 -mx-4 overflow-x-auto overscroll-x-contain px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-5 sm:px-5 [&::-webkit-scrollbar]:hidden">
                  <div className="flex w-max flex-nowrap gap-1.5">
                    {issueTags.map((tag) => (
                      <span
                        key={tag}
                        className="shrink-0 whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </FadeIn>

        <FadeIn className="mt-6">
          <RecentReviews ratings={ratings} heading="All reviews" />
        </FadeIn>
      </div>
    </main>
  )
}
