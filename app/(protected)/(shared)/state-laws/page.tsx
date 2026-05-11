"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { Search } from "lucide-react"
import { api } from "@/convex/_generated/api"

export default function StateLawsPage() {
  const stateLaws = useQuery(api.stateLaws.queries.getAllStateLaws)
  const [query, setQuery] = useState("")

  const filteredStateLaws = useMemo(() => {
    if (!stateLaws) return []
    const normalized = query.trim().toLowerCase()
    if (!normalized) return stateLaws
    return stateLaws.filter((state) => {
      const code = state.stateCode.toLowerCase()
      const name = (state.stateName ?? "").toLowerCase()
      return code.includes(normalized) || name.includes(normalized)
    })
  }, [stateLaws, query])

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 md:mb-8">
          <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">State Tenant Laws</h1>
          <p className="mt-2 text-ink-warm-muted">
            Quick reference guides for tenant rights, deposit caps, and eviction notices across the US.
          </p>
        </header>

        <div className="mb-6 md:mb-8">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-warm-muted" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by state name or code"
              className="h-11 w-full rounded-2xl border border-cream-border bg-cream-surface pl-11 pr-4 text-sm text-foreground outline-none ring-0 placeholder:text-ink-warm-muted focus:border-primary"
            />
          </div>
        </div>

        {stateLaws === undefined ? (
          <p className="text-muted-foreground">Loading state laws...</p>
        ) : stateLaws.length === 0 ? (
          <div className="rounded-3xl border border-cream-border bg-cream-surface p-8 text-center">
            <p className="font-heading text-2xl text-ink-warm">No state laws found</p>
            <p className="mt-2 text-ink-warm-muted">
              State laws haven't been populated in the database yet.
            </p>
          </div>
        ) : filteredStateLaws.length === 0 ? (
          <div className="rounded-3xl border border-cream-border bg-cream-surface p-8 text-center">
            <p className="font-heading text-2xl text-ink-warm">No matching states</p>
            <p className="mt-2 text-ink-warm-muted">
              Try searching with a different state name or 2-letter code.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredStateLaws.map((state) => (
              <Link
                key={state.stateCode}
                href={`/state-laws/${state.stateCode}`}
                className="group flex flex-col items-center justify-center gap-3 rounded-3xl border border-cream-border bg-cream-surface p-6 text-center transition hover:bg-cream-surface-soft hover:shadow-sm"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-cream-page text-ink-warm transition-transform group-hover:scale-105">
                  <span className="font-heading text-xl font-semibold">{state.stateCode}</span>
                </div>
                <span className="text-sm font-medium text-ink-warm-muted group-hover:text-foreground">
                  {state.stateName}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
