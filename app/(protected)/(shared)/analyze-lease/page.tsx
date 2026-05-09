"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAction, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Upload, FileText, X, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  US_STATE_NAMES,
  filterUSStates,
  type USStateAbbr,
} from "@/lib/constants/us-states"

export default function AnalyzeLeasePage() {
  const generateUploadUrl = useMutation(
    api.analyzeLease.mutations.generateUploadUrl,
  )
  const extractLeaseText = useAction(
    api.analyzeLease.actions.extractLeaseText,
  )

  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<string>("")
  const [stateSearch, setStateSearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stateChipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const filteredStates = useMemo(
    () => filterUSStates(stateSearch),
    [stateSearch],
  )

  const chipsToShow = useMemo(() => {
    if (!state) return filteredStates
    const sel = state as USStateAbbr
    if (filteredStates.includes(sel)) return filteredStates
    return [sel, ...filteredStates]
  }, [filteredStates, state])

  const selectionHiddenBySearch =
    Boolean(state) &&
    stateSearch.trim().length > 0 &&
    !filteredStates.includes(state as USStateAbbr)

  const selectedStateName = useMemo(
    () => (state ? US_STATE_NAMES[state as USStateAbbr] : ""),
    [state],
  )

  useEffect(() => {
    const el = stateChipRefs.current.get(state)
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }, [state])

  const canSubmit = Boolean(file && state && !isSubmitting)

  const handleFile = useCallback((incoming: File | null) => {
    setError(null)
    if (!incoming) {
      setFile(null)
      return
    }
    const allowed = [
      "application/pdf",
      "text/plain",
    ]
    if (!allowed.includes(incoming.type)) {
      setError("Please upload a PDF or text file.")
      return
    }
    if (incoming.size > 20 * 1024 * 1024) {
      setError("File must be under 20 MB.")
      return
    }
    setFile(incoming)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleFile(dropped)
    },
    [handleFile],
  )

  const onSubmit = async () => {
    if (!canSubmit || !file) return
    setError(null)
    setIsSubmitting(true)
    try {
      const uploadUrl = await generateUploadUrl()

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!uploadRes.ok) throw new Error("File upload failed")

      const { storageId } = (await uploadRes.json()) as {
        storageId: string
      }

      const result = await extractLeaseText({
        storageId: storageId as any,
        state,
      })

      console.log("Lease extracted:", result)
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to analyze lease"
      setError(message)
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-cream-page pb-28 pt-5 md:min-h-[calc(100vh-4rem)] md:pb-10 md:pt-6 lg:pt-8">
      <div className="flex w-full flex-1 flex-col px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16">
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-cream-border bg-cream-surface p-5 shadow-sm sm:p-7 md:rounded-3xl md:p-10 lg:p-12 xl:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">
            AI &middot; Red Flag Detector
          </p>
          <h2 className="mt-3 max-w-5xl font-heading text-4xl font-semibold leading-[0.95] text-ink-warm text-balance sm:text-5xl md:text-6xl lg:text-7xl xl:max-w-6xl">
            Upload your lease.{" "}
            <br className="hidden sm:block" />
            We&rsquo;ll find the traps.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-ink-warm-muted text-pretty sm:text-xl lg:max-w-4xl lg:text-2xl">
            Our AI reviews every clause against your state&rsquo;s tenant law
            and flags illegal or one-sided terms.
          </p>

          {/* Upload area */}
          <div className="mx-auto mt-8 w-full max-w-3xl md:mt-10 lg:mt-12">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              className={[
                "group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-colors md:rounded-3xl md:py-16",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : file
                    ? "border-cream-border bg-cream-surface-soft"
                    : "border-cream-border bg-background hover:border-primary/50 hover:bg-cream-surface-soft",
              ].join(" ")}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="size-8 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-ink-warm md:text-lg">
                      {file.name}
                    </p>
                    <p className="text-sm text-ink-warm-muted">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="flex size-8 items-center justify-center rounded-full text-ink-warm-muted transition-colors hover:bg-cream-surface-deep hover:text-ink-warm"
                    aria-label="Remove file"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex size-16 items-center justify-center rounded-full bg-cream-surface-soft transition-colors group-hover:bg-cream-surface-deep md:size-20">
                    <Upload className="size-6 text-ink-warm-muted md:size-7" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-ink-warm md:text-xl">
                    Tap to upload PDF
                  </p>
                  <p className="mt-1 text-sm text-ink-warm-muted md:text-base">
                    PDF or text file
                  </p>
                </>
              )}
            </div>
          </div>

          {/* State selector */}
          <div className="mx-auto mt-8 w-full max-w-3xl md:mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted md:text-sm">
              State
            </p>
            <div className="relative mt-3 w-full">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                placeholder="Search by name or code…"
                autoComplete="off"
                className="h-10 w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11 md:text-base"
                aria-label="Search states"
              />
            </div>

            {selectionHiddenBySearch ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected: {selectedStateName} ({state}) — clear search to
                browse all, or pick below.
              </p>
            ) : null}

            <div className="relative mt-3 w-full min-w-0">
              <div
                className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden px-1 pb-2 [scrollbar-width:thin] touch-pan-x"
                role="listbox"
                aria-label="Select state"
              >
                {chipsToShow.map((abbr) => {
                  const active = state === abbr
                  return (
                    <button
                      key={abbr}
                      type="button"
                      role="option"
                      aria-selected={active}
                      ref={(el) => {
                        if (el) stateChipRefs.current.set(abbr, el)
                        else stateChipRefs.current.delete(abbr)
                      }}
                      onClick={() => setState(abbr)}
                      title={US_STATE_NAMES[abbr]}
                      className={[
                        "inline-flex h-12 shrink-0 snap-start items-center justify-center rounded-2xl border px-[1.1rem] text-base transition md:min-w-[4.25rem] md:px-5 md:text-lg",
                        active
                          ? "border-cream-border bg-cream-surface-deep text-ink-warm shadow-sm ring-1 ring-cream-border/80 font-semibold"
                          : "border-transparent bg-background font-medium text-foreground hover:bg-accent",
                      ].join(" ")}
                    >
                      {abbr}
                    </button>
                  )
                })}
              </div>
            </div>

            {stateSearch.trim() !== "" && filteredStates.length === 0 ? (
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                No states match your search.
              </p>
            ) : null}
          </div>

          {/* Error */}
          {error ? (
            <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}

          {/* Submit */}
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => void onSubmit()}
            className="mx-auto mt-8 h-14 w-full max-w-xl rounded-2xl bg-surface-strong px-6 text-lg font-semibold text-white hover:bg-surface-strong-hover disabled:bg-muted disabled:text-muted-foreground md:mt-10 md:text-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                Analyzing…
              </span>
            ) : (
              "Analyze Lease"
            )}
          </Button>
        </section>
      </div>
    </main>
  )
}
