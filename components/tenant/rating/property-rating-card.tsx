"use client"

import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import { PropertyCardImage } from "@/components/tenant/rating/property-card-image"
import { Card } from "@/components/ui/card"
import type { Id } from "@/convex/_generated/dataModel"

type PropertyRatingCardProps = {
  property: {
    _id: Id<"properties">
    name: string
    imageUrl: string | null
    reviewCount: number
    overallRating: number | null
    tags: string[]
  }
}

export function PropertyRatingCard({ property }: PropertyRatingCardProps) {
  return (
    <Link href={`/ratings/${property._id}`} className="group block">
      <Card className="gap-0 overflow-hidden rounded-3xl border border-border py-0 shadow-none ring-0 transition hover:bg-accent">
        <PropertyCardImage imageUrl={property.imageUrl} propertyId={property._id} />
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-1 font-heading text-lg font-semibold leading-snug text-foreground sm:text-xl">
                {property.name}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                {property.reviewCount === 0
                  ? "No reviews yet"
                  : `${property.reviewCount} review${property.reviewCount === 1 ? "" : "s"}`}
              </p>
            </div>
            <p className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-foreground sm:text-sm">
              <Star className="size-3.5 fill-primary text-primary" aria-hidden />
              {property.overallRating != null ? property.overallRating.toFixed(1) : "—"}
            </p>
          </div>
          {property.tags.length > 0 ? (
            <div className="mt-3 -mx-4 overflow-x-auto overscroll-x-contain px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-5 sm:px-5 [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max flex-nowrap gap-1.5">
                {property.tags.map((tag) => (
                  <span
                    key={tag}
                    className="shrink-0 whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  )
}
