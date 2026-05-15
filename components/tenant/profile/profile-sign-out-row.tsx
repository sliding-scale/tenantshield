"use client"

import { SignOutButton, useUser } from "@clerk/nextjs"
import { ChevronRight, LogOut, KeyRound } from "lucide-react"
import Link from "next/link"

export function ProfileSignOutRow() {
  const { user, isLoaded } = useUser()
  
  // Check if user is signed in with Google
  const isGoogleAuth = user?.externalAccounts.some(acc => (acc.provider as string) === "oauth_google" || (acc.provider as string) === "google")

  return (
    <section aria-labelledby="profile-account-heading" className="mt-8 md:mt-10">
      <h2
        id="profile-account-heading"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted"
      >
        Account
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {isLoaded && !isGoogleAuth && (
          <Link
            href="/profile/change-password"
            className="group flex w-full min-h-14 items-center gap-3 rounded-2xl border border-cream-border bg-cream-surface-soft px-3 py-3.5 text-left transition hover:border-foreground/25 hover:bg-white sm:gap-4 sm:px-4 sm:py-4 md:min-h-16"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 md:size-12">
              <KeyRound className="size-5 md:size-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-lg font-semibold text-ink-warm md:text-xl">Change Password</span>
              <span className="mt-0.5 block text-sm text-ink-warm-muted md:text-base">Update your account password</span>
            </span>
            <ChevronRight
              className="size-5 shrink-0 text-muted-foreground transition group-hover:text-foreground"
              aria-hidden
            />
          </Link>
        )}

        <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
          <button
            type="button"
            className="group flex w-full min-h-14 items-center gap-3 rounded-2xl border border-cream-border bg-cream-surface-soft px-3 py-3.5 text-left transition hover:border-destructive/25 hover:bg-destructive/5 sm:gap-4 sm:px-4 sm:py-4 md:min-h-16"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive ring-1 ring-destructive/20 md:size-12">
              <LogOut className="size-5 md:size-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-lg font-semibold text-destructive md:text-xl">Sign Out</span>
              <span className="mt-0.5 block text-sm text-ink-warm-muted md:text-base">End this session</span>
            </span>
            <ChevronRight
              className="size-5 shrink-0 text-destructive/80 transition group-hover:text-destructive"
              aria-hidden
            />
          </button>
        </SignOutButton>
      </div>
    </section>
  )
}
