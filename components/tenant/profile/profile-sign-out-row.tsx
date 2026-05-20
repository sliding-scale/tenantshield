"use client"

import { SignOutButton, useUser } from "@clerk/nextjs"
import { KeyRound, LogOut, ChevronRight } from "lucide-react"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { MobileListRow, mobileListRowInnerClass } from "@/components/shared/mobile-list-row"
import { Card } from "@/components/ui/card"

export function ProfileSignOutRow() {
  const { user, isLoaded } = useUser()

  const isGoogleAuth = user?.externalAccounts.some(
    (acc) => (acc.provider as string) === "oauth_google" || (acc.provider as string) === "google",
  )

  return (
    <section aria-labelledby="profile-account-heading" className="mt-8 md:mt-10">
      <h2
        id="profile-account-heading"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
      >
        Account
      </h2>
      <FadeInStagger className="mt-3 flex flex-col gap-3 md:gap-4">
        {isLoaded && !isGoogleAuth ? (
          <FadeIn stagger>
            <MobileListRow
              href="/profile/change-password"
              title="Change Password"
              subtitle="Update your account password"
              Icon={KeyRound}
            />
          </FadeIn>
        ) : null}

        <FadeIn stagger>
          <Card className="gap-0 overflow-hidden rounded-2xl border border-border py-0 shadow-none ring-0">
            <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
              <button type="button" className={mobileListRowInnerClass}>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive md:size-12">
                  <LogOut className="size-5 md:size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block font-heading text-lg font-semibold text-destructive md:text-xl">
                    Sign Out
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground md:text-base">
                    End this session
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-destructive/80 transition group-hover:text-destructive"
                  aria-hidden
                />
              </button>
            </SignOutButton>
          </Card>
        </FadeIn>
      </FadeInStagger>
    </section>
  )
}
