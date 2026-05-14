"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import NoAccessMessage from "@/components/shared/NoAccessMessage"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/properties", label: "Properties" },
] as const

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { role, isLoading, convexUser } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!convexUser || role !== "admin") {
    return (
      <NoAccessMessage
        title="Admin only"
        body="You don’t have permission to view this section."
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground">Manage users and property listings.</p>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Admin sections">
        {links.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-popover text-foreground hover:bg-accent",
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      {children}
    </div>
  )
}
