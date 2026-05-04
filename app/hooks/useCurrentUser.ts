"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import type { Doc } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"

export type CurrentUser = {
  clerkUser: ReturnType<typeof useUser>["user"]
  role: Doc<"users">["role"] | null
  convexUser: Doc<"users"> | null | undefined
  isLoading: boolean
}

export default function useCurrentUser(): CurrentUser {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()

  const convexUser = useQuery(
    api.users.queries.current,
    clerkLoaded && clerkUser ? {} : "skip",
  )

  const isLoading =
    !clerkLoaded || (Boolean(clerkUser) && convexUser === undefined)

  const role =
    convexUser === undefined || convexUser === null ? null : convexUser.role

  return {
    clerkUser,
    role,
    convexUser,
    isLoading,
  }
}
