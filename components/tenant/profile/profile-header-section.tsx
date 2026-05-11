"use client"

import { Star } from "lucide-react"
import useCurrentUser from "@/app/hooks/useCurrentUser"

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

  if (isLoading || !clerkUser) {
    return (
      <section className="animate-pulse" aria-busy="true" aria-label="Loading profile">
        <div className="h-3 w-16 rounded bg-cream-surface-deep" />
        <div className="mt-4 flex gap-4">
          <div className="size-16 shrink-0 rounded-full bg-cream-surface-deep md:size-20" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <div className="h-7 w-40 rounded bg-cream-surface-deep md:h-8 md:w-48" />
            <div className="h-4 w-56 rounded bg-cream-surface-deep" />
            <div className="h-6 w-24 rounded-full bg-cream-surface-deep" />
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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted">Profile</p>
      <div className="mt-4 flex gap-4 md:mt-5 md:gap-5">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-strong font-heading text-2xl font-semibold text-cream-surface-soft md:size-20 md:text-3xl"
          aria-hidden
        >
          {initialLetter(clerkUser)}
        </div>
        <div className="min-w-0 flex-1">
          <h1
            id="profile-user-heading"
            className="font-heading text-2xl font-semibold leading-tight text-ink-warm md:text-3xl lg:text-4xl"
          >
            {name}
          </h1>
          {email ? (
            <p className="mt-1 truncate text-sm text-ink-warm-muted md:text-base">{email}</p>
          ) : null}
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            <Star className="size-3.5 fill-primary-foreground" aria-hidden />
            Pro
          </p>
        </div>
      </div>
    </section>
  )
}
