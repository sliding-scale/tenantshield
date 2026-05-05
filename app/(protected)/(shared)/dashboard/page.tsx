"use client"

import AdminDashboardMain from "@/components/admin/dashboard-main"
import TenantDashboardMain from "@/components/tenant/dashboard-main"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import NoAccessMessage from "@/components/shared/NoAccessMessage"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SharedDashboardPage() {
  const router = useRouter()
  const { role, isLoading, convexUser, clerkUser } = useCurrentUser()
  const onboardingStatus = useQuery(
    api.onboarding.queries.onboardingStatus,
    clerkUser ? {} : "skip",
  )

  useEffect(() => {
    if (role === "tenant" && onboardingStatus?.shouldShowOnboarding) {
      router.replace("/onboarding")
    }
  }, [role, onboardingStatus, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-foreground dark:border-neutral-600"
          aria-hidden
        />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Loading your account…
        </p>
      </div>
    )
  }

  if (!clerkUser) {
    return (
      <NoAccessMessage
        title="Sign in required"
        body="You need to be signed in to view the dashboard."
      />
    )
  }

  if (convexUser === null) {
    return (
      <NoAccessMessage
        title="Account setup in progress"
        body="Your profile is not ready yet. This usually finishes right after sign-up. Try refreshing in a moment, or contact support if it continues."
      />
    )
  }

  if (role === "admin") {
    return <AdminDashboardMain />
  }

  if (role === "tenant") {
    if (onboardingStatus === undefined) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-foreground dark:border-neutral-600"
            aria-hidden
          />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Checking onboarding…
          </p>
        </div>
      )
    }
    if (onboardingStatus?.shouldShowOnboarding) {
      return null
    }
    return <TenantDashboardMain />
  }

  return null
}
