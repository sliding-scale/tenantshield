"use client"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"

export default function AdminDashboardMain() {
  const { userId } = useAuth()
  const user = useQuery(api.users.queries.current, userId ? {} : "skip")
  if (!user || user.role !== "admin") {
    return <div>You are not authorized to access this page</div>
  }
  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Admin dashboard</h1>
      <p className="text-sm text-muted-foreground">Open a management area below.</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/users">Users</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/properties">Properties</Link>
        </Button>
      </div>
    </div>
  )
}
