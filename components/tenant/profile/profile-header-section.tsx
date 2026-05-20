"use client"

import { MapPin } from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"

function displayName(clerkUser: NonNullable<ReturnType<typeof useCurrentUser>["clerkUser"]>) {
  const parts = [clerkUser.firstName, clerkUser.lastName].filter(Boolean)
  if (parts.length > 0) return parts.join(" ")
  if (clerkUser.username?.trim()) return clerkUser.username.trim()
  const email = clerkUser.primaryEmailAddress?.emailAddress
  if (email) return email.split("@")[0] ?? "User"
  return "User"
}

export function ProfileHeaderSection() {
  const { clerkUser, convexUser, isLoading } = useCurrentUser()

  if (isLoading || !clerkUser) {
    return (
      <section className="animate-pulse" aria-busy="true" aria-label="Loading profile">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="mt-3 h-9 w-48 rounded bg-muted md:h-10 md:w-56" />
        <div className="mt-2 h-4 w-56 rounded bg-muted" />
      </section>
    )
  }

  const name = convexUser?.name?.trim() || displayName(clerkUser)
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? ""
  const stateLabel = convexUser?.state
    ? `${US_STATE_NAMES[convexUser.state as USStateAbbr] ?? convexUser.state} (${convexUser.state})`
    : null

  return (
    <section aria-labelledby="profile-user-heading">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Profile
      </p>
      <h1
        id="profile-user-heading"
        className="mt-2 font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl"
      >
        {name}
      </h1>
      {email ? (
        <p className="mt-1 truncate text-sm text-muted-foreground md:text-base">{email}</p>
      ) : null}
      {stateLabel ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground md:text-base">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {stateLabel}
        </p>
      ) : null}
    </section>
  )
}
