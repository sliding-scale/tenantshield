"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { Search } from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400
const PLACEHOLDER = "/placeholder-property.svg"

function AdminPropertiesResults({ searchName }: { searchName: string }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null])
  const [pendingId, setPendingId] = useState<Id<"properties"> | null>(null)

  const { role } = useCurrentUser()
  const setPropertyEnabled = useMutation(api.admin.mutations.setPropertyEnabled)

  const currentCursor = cursorStack[pageIndex] ?? null

  const data = useQuery(
    api.admin.queries.listPropertiesPaginated,
    role === "admin"
      ? {
          searchName,
          paginationOpts: { numItems: PAGE_SIZE, cursor: currentCursor },
        }
      : "skip",
  )

  useEffect(() => {
    if (!data || data.isDone || !data.continueCursor) return
    const cursor = data.continueCursor
    queueMicrotask(() => {
      setCursorStack((stack) => {
        if (stack[pageIndex + 1] === cursor) return stack
        const next = [...stack]
        next[pageIndex + 1] = cursor
        return next
      })
    })
  }, [data, pageIndex])

  const loading = data === undefined
  const rows = data?.page ?? []
  const canNext = Boolean(data && !data.isDone && rows.length > 0)
  const canPrev = pageIndex > 0

  const toggleEnabled = async (propertyId: Id<"properties">, enabled: boolean) => {
    setPendingId(propertyId)
    try {
      await setPropertyEnabled({ propertyId, enabled })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-popover shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 font-semibold text-foreground">Name</th>
              <th className="px-4 py-3 font-semibold text-foreground">Picture</th>
              <th className="px-4 py-3 font-semibold text-foreground">Ratings</th>
              <th className="px-4 py-3 font-semibold text-foreground">Avg. rating</th>
              <th className="px-4 py-3 font-semibold text-foreground">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10">
                  <div className="flex justify-center">
                    <ShieldLoader variant="admin" embedded label="Loading properties…" />
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No properties match this search.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Convex signed URL */}
                    <img
                      src={row.imageUrl?.trim() ? row.imageUrl.trim() : PLACEHOLDER}
                      alt=""
                      className="size-12 rounded-lg border border-border object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{row.ratingCount}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {row.avgRating === null ? "—" : row.avgRating.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-foreground">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border accent-foreground"
                        checked={row.enabled}
                        disabled={pendingId === row._id}
                        onChange={(e) => void toggleEnabled(row._id, e.target.checked)}
                      />
                      <span className="sr-only">Enable or disable {row.name}</span>
                      <span className="text-xs text-muted-foreground" aria-hidden>
                        {row.enabled ? "On" : "Off"}
                      </span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Page {pageIndex + 1}
          {!loading && rows.length > 0 ? ` · ${rows.length} row${rows.length === 1 ? "" : "s"}` : null}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={!canPrev || loading}
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={!canNext || loading}
            onClick={() => setPageIndex((i) => i + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}

export default function AdminPropertiesPage() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchInput])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground">Properties</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Landlord listings and ratings ({PAGE_SIZE} per page).
        </p>
      </div>

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search by name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-11 rounded-full border-border bg-popover pl-10 pr-4 shadow-sm"
          aria-label="Search properties by name"
        />
      </div>

      <AdminPropertiesResults key={debouncedSearch} searchName={debouncedSearch} />
    </div>
  )
}
