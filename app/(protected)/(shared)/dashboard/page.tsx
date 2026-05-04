"use client"

import AdminDashboardMain from "@/components/admin/dashboard-main"
import TenantDashboardMain from "@/components/tenant/dashboard-main"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import NoAccessMessage from "@/components/shared/NoAccessMessage"

export default function SharedDashboardPage() {
  const { role, isLoading, convexUser, clerkUser } = useCurrentUser()

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
    return <TenantDashboardMain />
  }
}
