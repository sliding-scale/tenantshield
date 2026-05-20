"use client"

import { useState } from "react"
import { Star, MapPin, Pencil, Check, X } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { US_STATES, US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"

function displayName(clerkUser: NonNullable<ReturnType<typeof useCurrentUser>["clerkUser"]>) {
  const parts = [clerkUser.firstName, clerkUser.lastName].filter(Boolean)
  if (parts.length > 0) return parts.join(" ")
  if (clerkUser.username?.trim()) return clerkUser.username.trim()
  const email = clerkUser.primaryEmailAddress?.emailAddress
  if (email) return email.split("@")[0] ?? "User"
  return "User"
}

function initialLetter(clerkUser: NonNullable<ReturnType<typeof useCurrentUser>["clerkUser"]>) {
  const fromName = clerkUser.firstName?.trim()?.[0] ?? clerkUser.lastName?.trim()?.[0]
  if (fromName) return fromName.toUpperCase()
  const email = clerkUser.primaryEmailAddress?.emailAddress
  if (email?.[0]) return email[0].toUpperCase()
  return "?"
}

export function ProfileHeaderSection() {
  const { clerkUser, convexUser, isLoading } = useCurrentUser()
  const updateState = useMutation(api.users.mutations.updateState)
  const [editingState, setEditingState] = useState(false)
  const [stateValue, setStateValue] = useState("")
  const [savingState, setSavingState] = useState(false)

  const handleEditState = () => {
    setStateValue(convexUser?.state ?? "")
    setEditingState(true)
  }

  const handleSaveState = async () => {
    setSavingState(true)
    try {
      await updateState({ state: stateValue })
      setEditingState(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSavingState(false)
    }
  }

  if (isLoading || !clerkUser) {
    return (
      <section className="animate-pulse" aria-busy="true" aria-label="Loading profile">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="mt-4 flex gap-4">
          <div className="size-16 shrink-0 rounded-full bg-muted md:size-20" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <div className="h-7 w-40 rounded bg-muted md:h-8 md:w-48" />
            <div className="h-4 w-56 rounded bg-muted" />
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
        </div>
      </section>
    )
  }

  const name =
    convexUser?.name?.trim() ||
    displayName(clerkUser)
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? ""

  return (
    <section aria-labelledby="profile-user-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
      <div className="mt-4 flex gap-4 md:mt-5 md:gap-5">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-foreground font-heading text-2xl font-semibold text-background md:size-20 md:text-3xl"
          aria-hidden
        >
          {initialLetter(clerkUser)}
        </div>
        <div className="min-w-0 flex-1">
          <h1
            id="profile-user-heading"
            className="font-heading text-2xl font-semibold leading-tight text-foreground md:text-3xl lg:text-4xl"
          >
            {name}
          </h1>
          {email ? (
            <p className="mt-1 truncate text-sm text-muted-foreground md:text-base">{email}</p>
          ) : null}

          {/* State row */}
          <div className="mt-2 flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            {editingState ? (
              <div className="flex items-center gap-2">
                <select
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  className="h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No state</option>
                  {US_STATES.map((abbr) => (
                    <option key={abbr} value={abbr}>
                      {US_STATE_NAMES[abbr]} ({abbr})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={savingState}
                  onClick={() => void handleSaveState()}
                  className="flex size-7 items-center justify-center rounded-full bg-foreground text-white hover:bg-foreground/90 disabled:opacity-60"
                  aria-label="Save state"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={savingState}
                  onClick={() => setEditingState(false)}
                  className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground disabled:opacity-60"
                  aria-label="Cancel"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">
                  {convexUser?.state
                    ? `${US_STATE_NAMES[convexUser.state as USStateAbbr] ?? convexUser.state} (${convexUser.state})`
                    : "No state set"}
                </span>
                <button
                  type="button"
                  onClick={handleEditState}
                  className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Edit state"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            <Star className="size-3.5 fill-primary-foreground" aria-hidden />
            Pro
          </p>
        </div>
      </div>
    </section>
  )
}
