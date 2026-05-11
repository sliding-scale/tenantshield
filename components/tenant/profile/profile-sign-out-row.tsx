"use client"

import { SignOutButton } from "@clerk/nextjs"
import { ChevronRight, LogOut } from "lucide-react"

export function ProfileSignOutRow() {
  return (
    <section aria-labelledby="profile-account-heading" className="mt-8 md:mt-10">
      <h2
        id="profile-account-heading"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-warm-muted"
      >
        Account
      </h2>
      <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
        <button
          type="button"
          className="group mt-3 flex w-full min-h-14 items-center gap-3 rounded-2xl border border-cream-border bg-cream-surface-soft px-3 py-3.5 text-left transition hover:border-destructive/25 hover:bg-destructive/5 sm:gap-4 sm:px-4 sm:py-4 md:min-h-16"
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
    </section>
  )
}
