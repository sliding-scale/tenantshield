"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { MapPin, Search, Star } from "lucide-react"
import { RATING_FILTER_TAGS, type IssueTypeValue, type RatingFilterTag } from "@/lib/constants/issue-types"

type PropertyRating = {
  id: string
  name: string
  location: string
  overallRating: number
  depositFairness: number
  repairSpeed: number
  responsiveness: number
  tags: IssueTypeValue[]
}

const PROPERTIES: PropertyRating[] = [
  {
    id: "p1",
    name: "1240 Oak Street, Apt 3B",
    location: "Little Rock, AR",
    overallRating: 3.8,
    depositFairness: 3.0,
    repairSpeed: 2.8,
    responsiveness: 3.6,
    tags: ["Security Deposit", "Repairs / Habitability"],
  },
  {
    id: "p2",
    name: "88 Pine Avenue",
    location: "Fayetteville, AR",
    overallRating: 4.5,
    depositFairness: 4.8,
    repairSpeed: 4.2,
    responsiveness: 4.6,
    tags: ["Other"],
  },
  {
    id: "p3",
    name: "22 Riverside Dr, Unit 5",
    location: "Jonesboro, AR",
    overallRating: 2.1,
    depositFairness: 1.5,
    repairSpeed: 2.0,
    responsiveness: 2.4,
    tags: ["Eviction Notice", "Lease Dispute"],
  },
  {
    id: "p4",
    name: "500 Elm Court",
    location: "Conway, AR",
    overallRating: 4.1,
    depositFairness: 4.0,
    repairSpeed: 3.8,
    responsiveness: 4.5,
    tags: ["Rent Increase"],
  },
  {
    id: "p5",
    name: "17 Maple Lane, Unit 2",
    location: "Springdale, AR",
    overallRating: 1.8,
    depositFairness: 1.2,
    repairSpeed: 1.6,
    responsiveness: 2.0,
    tags: ["Lease Dispute", "Security Deposit"],
  },
  {
    id: "p6",
    name: "330 Birch Blvd",
    location: "Hot Springs, AR",
    overallRating: 3.3,
    depositFairness: 3.5,
    repairSpeed: 2.2,
    responsiveness: 3.0,
    tags: ["Repairs / Habitability"],
  },
]

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
      <div className="min-w-0">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-warm-muted">
          {label}
        </p>
        <div className="h-1 w-full rounded-full bg-cream-surface-deep">
          <div
            className="h-1 rounded-full bg-primary"
            style={{ width: `${Math.max(0, Math.min(100, (value / 5) * 100))}%` }}
          />
        </div>
      </div>
      <p className="w-6 text-right text-xs font-semibold text-ink-warm">{value.toFixed(1)}</p>
    </div>
  )
}

export default function RatingsPage() {
  const [selectedTag, setSelectedTag] = useState<RatingFilterTag>("All Properties")
  const [search, setSearch] = useState("")

  const filteredProperties = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return PROPERTIES.filter((property) => {
      const matchesTag =
        selectedTag === "All Properties" ? true : property.tags.includes(selectedTag)
      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : `${property.name} ${property.location}`.toLowerCase().includes(normalizedSearch)
      return matchesTag && matchesSearch
    })
  }, [selectedTag, search])

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-5 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-screen-2xl">
        <header className="mb-5 md:mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary md:text-xs">
            Property Ratings
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold leading-snug text-foreground md:text-3xl lg:text-[2rem]">
            Know Before You Sign.
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-warm-muted">
            Anonymous ratings from verified tenants. Spot patterns before choosing your next
            rental.
          </p>
        </header>

        <section className="rounded-2xl border border-cream-border  p-3 md:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-warm-muted" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by address, city, or property name..."
              className="h-9 w-full rounded-xl border border-cream-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-ink-warm-muted focus:border-primary focus:outline-none md:text-sm"
            />
          </div>
        </section>

        <section className="mt-3 flex flex-wrap gap-1.5 md:gap-2">
          {RATING_FILTER_TAGS.map((tag) => {
            const active = selectedTag === tag
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium transition md:px-3.5 md:py-1.5 md:text-[13px]",
                  active
                    ? "border-surface-strong bg-surface-strong text-white"
                    : "border-border bg-background text-foreground hover:bg-accent",
                ].join(" ")}
              >
                {tag}
              </button>
            )
          })}
        </section>

        <section className="mt-4 md:mt-5">
          {filteredProperties.length === 0 ? (
            <div className="rounded-2xl border border-cream-border bg-cream-surface p-8 text-center md:p-10">
              <p className="font-heading text-xl text-ink-warm md:text-2xl">No properties found</p>
              <p className="mt-2 text-sm text-ink-warm-muted">Try another search or filter tag.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
              {filteredProperties.map((property) => (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-cream-border bg-cream-surface shadow-sm"
                >
                  <div className="relative h-[7.5rem] w-full border-b border-cream-border bg-cream-surface-soft sm:h-28">
                    <Image
                      src="/placeholderhouse.png"
                      alt={`Placeholder for ${property.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-3 sm:p-3.5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 font-heading text-sm font-semibold leading-snug text-ink-warm md:text-[0.9375rem]">
                        {property.name}
                      </h2>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-warm-muted md:text-xs">
                        <MapPin className="size-3 shrink-0" />
                        {property.location}
                      </p>
                    </div>
                    <p className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-cream-surface-soft px-2 py-0.5 text-xs font-semibold text-ink-warm">
                      <Star className="size-3 fill-primary text-primary" />
                      {property.overallRating.toFixed(1)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {property.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-cream-border bg-cream-surface-soft px-2 py-0.5 text-[10px] font-medium text-ink-warm-muted md:text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
