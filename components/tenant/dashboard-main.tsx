"use client"
import { useAuth } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect } from "react"
export default function TenantDashboardMain() {
  const { userId } = useAuth()
  const user = useQuery(api.users.queries.current, userId ? {} : "skip")
  useEffect(() => {
    console.log(user)
  }, [user])
  if (!user || user.role !== "tenant") {
    return <div>You are not authorized to access this page</div>
  }
  return <div>Tenant DashboardMain</div>
}
