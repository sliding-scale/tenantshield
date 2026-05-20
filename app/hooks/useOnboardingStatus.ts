"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function useOnboardingStatus(clerkId: string | undefined) {
  const onboardingStatus = useQuery(
    api.onboarding.queries.onboardingStatus,
    clerkId ? {} : "skip",
  )

  const isLoading = Boolean(clerkId) && onboardingStatus === undefined

  return { onboardingStatus, isLoading }
}
