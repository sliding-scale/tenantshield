"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { MapPin, Plus, Search, Star } from "lucide-react"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { usePaginatedQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  RATING_FILTER_TAGS,
  type IssueTypeValue,
  type RatingFilterTag,
} from "@/lib/constants/issue-types"
import { PropertyCardImage } from "@/components/tenant/rating/property-card-image"

const PAGE_SIZE = 15
/** Delay Convex search until typing pauses — avoids a query per keystroke. */
const SEARCH_DEBOUNCE_MS = 500

export default function RatingsPage() {
  const [selectedTag, setSelectedTag] = useState<RatingFilterTag>("All Properties")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchInput])

  const { results, status, loadMore } = usePaginatedQuery(
    api.properties.queries.searchByName,
    { query: debouncedSearch },
    { initialNumItems: PAGE_SIZE },
  )

  const loadingFirstPage = status === "LoadingFirstPage"
  const loadingMore = status === "LoadingMore"
  const canLoadMore = status === "CanLoadMore"
  const exhausted = status === "Exhausted"

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !canLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          loadMore(PAGE_SIZE)
        }
      },
      { root: null, rootMargin: "280px", threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [canLoadMore, loadMore, debouncedSearch])

  const filteredProperties = useMemo(() => {
    return results.filter((property) => {
      const matchesTag =
        selectedTag === "All Properties"
          ? true
          : property.tags.includes(selectedTag as IssueTypeValue)
      return matchesTag
    })
  }, [results, selectedTag])

  const trimmedDebounced = debouncedSearch.trim()
  const serverHasRows = results.length > 0
  const hasCards = filteredProperties.length > 0

  const showEmptySearch =
    !loadingFirstPage && trimmedDebounced.length > 0 && results.length === 0 && exhausted
  const showEmptyAll =
    !loadingFirstPage && trimmedDebounced.length === 0 && results.length === 0 && exhausted
  const showEmptyFilter =
    !loadingFirstPage && serverHasRows && !hasCards && selectedTag !== "All Properties"

  const nameForCreate = searchInput.trim() || trimmedDebounced
  const createHref = nameForCreate
    ? `/ratings/create?name=${encodeURIComponent(nameForCreate)}`
    : "/ratings/create"

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

        <section className="rounded-2xl border border-cream-border bg-cream-surface/40 p-3 md:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-warm-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by address, city, or property name..."
              className="h-9 w-full rounded-xl border border-cream-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-ink-warm-muted focus:border-primary focus:outline-none md:text-sm"
            />
          </div>
        </section>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-full shrink-0 gap-1.5 rounded-xl border-cream-border bg-cream-surface text-xs font-semibold text-foreground hover:bg-cream-surface-soft sm:w-auto sm:text-sm"
            asChild
          >
            <Link href={createHref}>
              <Plus className="size-3.5 shrink-0 sm:size-4" aria-hidden />
              Create property
            </Link>
          </Button>
        </div>

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

        {showEmptySearch ? (
          <section className="mt-4 rounded-2xl border border-cream-border bg-cream-surface p-6 text-center md:p-8">
            <p className="font-heading text-xl text-ink-warm md:text-2xl">
              No such property found
            </p>
            <p className="mt-2 text-sm text-ink-warm-muted">
              We couldn&apos;t find a property matching{" "}
              <span className="font-semibold text-ink-warm">&ldquo;{trimmedDebounced}&rdquo;</span>.
              Add it now so other tenants can find it too.
            </p>
            <Button
              size="sm"
              className="mt-5 h-10 gap-1.5 rounded-full border-0 bg-surface-strong px-4 text-sm font-semibold text-white shadow-md hover:bg-surface-strong-hover"
              asChild
            >
              <Link href={createHref}>
                <Plus className="size-4" />
                Create property
              </Link>
            </Button>
          </section>
        ) : null}

        {showEmptyAll ? (
          <section className="mt-4 rounded-2xl border border-cream-border bg-cream-surface p-6 text-center md:p-8">
            <p className="font-heading text-xl text-ink-warm md:text-2xl">
              No properties yet
            </p>
            <p className="mt-2 text-sm text-ink-warm-muted">
              Be the first to add a property and start the rating history.
            </p>
            <Button
              size="sm"
              className="mt-5 h-10 gap-1.5 rounded-full border-0 bg-surface-strong px-4 text-sm font-semibold text-white shadow-md hover:bg-surface-strong-hover"
              asChild
            >
              <Link href="/ratings/create">
                <Plus className="size-4" />
                Create property
              </Link>
            </Button>
          </section>
        ) : null}

        {showEmptyFilter ? (
          <section className="mt-4 rounded-2xl border border-cream-border bg-cream-surface p-8 text-center md:p-10">
            <p className="font-heading text-xl text-ink-warm md:text-2xl">No properties found</p>
            <p className="mt-2 text-sm text-ink-warm-muted">
              No listings match this issue tag in what&apos;s loaded so far. Try &ldquo;All
              Properties&rdquo;, load more below, or pick another filter.
            </p>
          </section>
        ) : null}

        {loadingFirstPage ? (
          <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[22rem] animate-pulse rounded-2xl border border-cream-border bg-cream-surface/60"
              />
            ))}
          </section>
        ) : null}

        {hasCards ? (
          <section className="mt-4 md:mt-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
              {filteredProperties.map((property) => (
                <Link
                  key={property._id}
                  href={`/ratings/${property._id}`}
                  className="group block overflow-hidden rounded-2xl border border-cream-border bg-cream-surface shadow-sm outline-none transition hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <article className="flex flex-col">
                    <PropertyCardImage
                      imageUrl={property.imageUrl}
                      propertyId={property._id}
                    />

                    <div className="p-3 sm:p-3.5">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h2 className="line-clamp-2 font-heading text-sm font-semibold leading-snug text-ink-warm group-hover:text-foreground md:text-[0.9375rem]">
                            {property.name}
                          </h2>
                          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-warm-muted md:text-xs">
                            <MapPin className="size-3 shrink-0" />
                            {property.reviewCount === 0
                              ? "No reviews yet"
                              : `${property.reviewCount} review${property.reviewCount === 1 ? "" : "s"}`}
                          </p>
                        </div>
                        <p className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-cream-surface-soft px-2 py-0.5 text-xs font-semibold text-ink-warm">
                          <Star className="size-3 fill-primary text-primary" />
                          {property.overallRating != null
                            ? property.overallRating.toFixed(1)
                            : "—"}
                        </p>
                      </div>
                      {property.tags.length > 0 ? (
                        <div className="mt-3 -mx-3 overflow-x-auto overscroll-x-contain px-3 pb-0.5 [scrollbar-width:thin] sm:-mx-3.5 sm:px-3.5">
                          <div className="flex w-max flex-nowrap gap-1.5">
                            {property.tags.map((tag) => (
                              <span
                                key={tag}
                                className="shrink-0 whitespace-nowrap rounded-full border border-cream-border bg-cream-surface-soft px-2 py-0.5 text-[10px] font-medium text-ink-warm-muted md:text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                </Link>
              ))}
            </div>

          </section>
        ) : null}

        {(canLoadMore || loadingMore) &&
        !loadingFirstPage &&
        !showEmptySearch &&
        !showEmptyAll ? (
          <div
            ref={sentinelRef}
            className="mt-6 flex min-h-14 items-center justify-center py-4"
          >
            {loadingMore ? (
              <span className="inline-flex items-center gap-3 text-sm text-ink-warm-muted">
                <ShieldLoader variant="ratings" compact />
                Loading more…
              </span>
            ) : (
              <span className="text-[11px] text-ink-warm-muted md:text-xs">
                Scroll for more properties
              </span>
            )}
          </div>
        ) : null}
      </div>
    </main>
  )
}
