"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, Star } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { RecentReviews } from "@/components/tenant/rating/recent-reviews"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"
//next image component import
import Image from "next/image"
export default function PropertyRatingsPage() {
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
          "min-h-svh bg-background px-4 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10",
          MOBILE_TAB_BAR_PAGE_SHELL,
        )}
      >
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-heading text-2xl text-foreground">Property not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This listing may have been removed or the link is incorrect.
          </p>
          <Button variant="outline" className="mt-6 rounded-full" asChild>
            <Link href="/ratings">Back to all ratings</Link>
          </Button>
        </div>
      </main>
    )
  }

  const overall = summary?.averages?.overall
  const count = summary?.count ?? 0

  return (
    <main
      className={cn(
        "min-h-svh bg-background px-4 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-8",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-screen-2xl">
        <Button
          variant="outline"
          size="sm"
          className="mb-5 gap-1 rounded-full border-border bg-background"
          asChild
        >
          <Link href="/ratings">
            <ChevronLeft className="size-4" />
            All properties
          </Link>
        </Button>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3 sm:gap-4">
            {/* Fixed box + absolute img stops SVG / hi-res uploads from blowing past the thumbnail */}
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-accent sm:size-20 md:size-24">
              <Image
                src={property.imageUrl ?? "/placeholder-property.svg"}
                alt=""
                fill
                className="absolute inset-0 h-full w-full object-cover"
                sizes="96px, (min-width: 640px) 128px, (min-width: 768px) 144px"
                priority
                unoptimized={property.imageUrl == null}
              />
      
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary md:text-xs">
                Property
              </p>
              <h1 className="mt-1 font-heading text-2xl font-semibold leading-snug text-foreground md:text-3xl">
                {property.name}
              </h1>
              <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-foreground">
                <Star className="size-4 fill-primary text-primary" />
                {overall !== undefined ? `${overall.toFixed(1)} overall` : "No ratings yet"}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({count} review{count === 1 ? "" : "s"})
                </span>
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="h-10 shrink-0 gap-1.5 self-start rounded-full border-0 bg-foreground px-4 text-sm font-semibold text-white shadow-md hover:bg-foreground/90 sm:self-auto"
            asChild
          >
            <Link href={`/ratings/give?propertyId=${encodeURIComponent(property._id)}`}>
              <Star className="size-3.5 text-white" strokeWidth={2} />
              Give a rating
            </Link>
          </Button>
        </div>

        <RecentReviews ratings={ratings} heading="All reviews" />
      </div>
    </main>
  )
}
