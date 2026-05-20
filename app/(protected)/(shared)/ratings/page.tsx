"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, ListFilter, Plus, Search } from "lucide-react"
import { usePaginatedQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { PropertyRatingCard } from "@/components/tenant/rating/property-rating-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  RATING_FILTER_TAGS,
  type IssueTypeValue,
  type RatingFilterTag,
} from "@/lib/constants/issue-types"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 15
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

  const filterActive = selectedTag !== "All Properties"

  return (
    <main
      className={cn(
        "min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <FadeIn>
          <header className="mb-6 md:mb-8">
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
                Ratings
              </h1>
              <Button
                variant="cta"
                size="icon-lg"
                className="size-11 shrink-0 rounded-full md:size-12"
                asChild
              >
                <Link href={createHref} aria-label="Create property">
                  <Plus className="size-5 md:size-6" aria-hidden />
                </Link>
              </Button>
            </div>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Anonymous ratings from verified tenants. Spot patterns before choosing your next
              rental.
            </p>
          </header>
        </FadeIn>

        <FadeIn>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by address, city, or property name…"
                className="h-11 rounded-2xl border-border bg-card pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-11 shrink-0 gap-1.5 rounded-2xl border-border bg-card px-3 sm:px-4",
                    filterActive && "border-foreground bg-accent",
                  )}
                  aria-label={`Filter by issue type. Current: ${selectedTag}`}
                >
                  <ListFilter className="size-4 shrink-0" aria-hidden />
                  <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
                    {filterActive ? selectedTag : "Filter"}
                  </span>
                  <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Issue type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={selectedTag}
                  onValueChange={(value) => setSelectedTag(value as RatingFilterTag)}
                >
                  {RATING_FILTER_TAGS.map((tag) => (
                    <DropdownMenuRadioItem key={tag} value={tag}>
                      {tag}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </FadeIn>

        {showEmptySearch ? (
          <FadeIn>
            <Card className="mt-6 gap-0 rounded-3xl border border-border py-0 text-center shadow-none ring-0">
              <div className="px-6 py-10 md:px-8 md:py-12">
                <p className="font-heading text-2xl font-semibold text-foreground">
                  No such property found
                </p>
                <p className="mt-2 text-muted-foreground">
                  We couldn&apos;t find a property matching{" "}
                  <span className="font-semibold text-foreground">
                    &ldquo;{trimmedDebounced}&rdquo;
                  </span>
                  . Add it so other tenants can find it too.
                </p>
                <Button variant="cta" className="mt-6 rounded-xl" asChild>
                  <Link href={createHref}>
                    <Plus className="size-4" aria-hidden />
                    Create property
                  </Link>
                </Button>
              </div>
            </Card>
          </FadeIn>
        ) : null}

        {showEmptyAll ? (
          <FadeIn>
            <Card className="mt-6 gap-0 rounded-3xl border border-border py-0 text-center shadow-none ring-0">
              <div className="px-6 py-10 md:px-8 md:py-12">
                <p className="font-heading text-2xl font-semibold text-foreground">
                  No properties yet
                </p>
                <p className="mt-2 text-muted-foreground">
                  Be the first to add a property and start the rating history.
                </p>
                <Button variant="cta" className="mt-6 rounded-xl" asChild>
                  <Link href="/ratings/create">
                    <Plus className="size-4" aria-hidden />
                    Create property
                  </Link>
                </Button>
              </div>
            </Card>
          </FadeIn>
        ) : null}

        {showEmptyFilter ? (
          <FadeIn>
            <Card className="mt-6 gap-0 rounded-3xl border border-border py-0 text-center shadow-none ring-0">
              <div className="px-6 py-10 md:px-8 md:py-12">
                <p className="font-heading text-2xl font-semibold text-foreground">
                  No properties found
                </p>
                <p className="mt-2 text-muted-foreground">
                  No listings match this issue tag in what&apos;s loaded so far. Try &ldquo;All
                  Properties&rdquo;, scroll for more, or pick another filter.
                </p>
              </div>
            </Card>
          </FadeIn>
        ) : null}

        {loadingFirstPage ? (
          <div className="mt-6 flex justify-center py-16">
            <ShieldLoader variant="ratings" embedded />
          </div>
        ) : null}

        {hasCards ? (
          <FadeInStagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
            {filteredProperties.map((property) => (
              <FadeIn key={property._id} stagger>
                <PropertyRatingCard property={property} />
              </FadeIn>
            ))}
          </FadeInStagger>
        ) : null}

        {(canLoadMore || loadingMore) &&
        !loadingFirstPage &&
        !showEmptySearch &&
        !showEmptyAll ? (
          <div
            ref={sentinelRef}
            className="mt-8 flex min-h-14 items-center justify-center py-4"
          >
            {loadingMore ? (
              <span className="inline-flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldLoader variant="ratings" compact />
                Loading more…
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  )
}
