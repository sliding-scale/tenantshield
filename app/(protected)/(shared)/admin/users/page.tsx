"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { Search } from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

function formatPlan(plan: string) {
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function AdminUsersResults({ searchName }: { searchName: string }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null])
  const { role } = useCurrentUser()

  const currentCursor = cursorStack[pageIndex] ?? null

  const data = useQuery(
    api.admin.queries.listUsersPaginated,
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

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-popover shadow-sm">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 font-semibold text-foreground">Name</th>
              <th className="px-4 py-3 font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 font-semibold text-foreground">Current plan</th>
              <th className="px-4 py-3 font-semibold text-foreground">Active cases</th>
              <th className="px-4 py-3 font-semibold text-foreground">Letters</th>
              <th className="px-4 py-3 font-semibold text-foreground">Chats</th>
              <th className="px-4 py-3 font-semibold text-foreground">Leases analyzed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <div className="flex justify-center">
                    <ShieldLoader variant="admin" embedded label="Loading users…" />
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No users match this search.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                  <td className="px-4 py-3 text-foreground">{formatPlan(row.currentPlan)}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{row.activeCases}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{row.generatedLetters}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{row.chatCount}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{row.leasesAnalyzed}</td>
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

export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [searchInput])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground">Users</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tenant and staff accounts with usage totals ({PAGE_SIZE} per page).
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
          aria-label="Search users by name"
        />
      </div>

      <AdminUsersResults key={debouncedSearch} searchName={debouncedSearch} />
    </div>
  )
}
