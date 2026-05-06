"use client"

import { Show, UserButton } from "@clerk/nextjs"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { APP_NAV_ITEMS } from "@/lib/nav/items"
import { cn } from "@/lib/utils"
import { isAuthPagePath } from "@/lib/nav/visibility"

export default function Navbar() {
  const pathname = usePathname()
  if (isAuthPagePath(pathname)) {
    return null
  }
  return (
    <header className="hidden h-16 items-center justify-between gap-4 border-b border-border px-4 sm:gap-6 sm:px-6 md:flex">
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
        <Link
          href="/"
          className="shrink-0 font-heading text-lg tracking-tight text-foreground sm:text-xl md:text-2xl"
        >
          TenantShield
        </Link>
        <Show when="signed-in">
          <nav className="ml-1 hidden items-center gap-1 lg:flex">
            {APP_NAV_ITEMS.map(({ href, label, matches }) => {
              const active = matches(pathname ?? "")
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </Show>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <Show when="signed-out">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full border border-primary bg-transparent px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10 sm:h-11 sm:px-5 sm:text-base"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11 sm:px-5 sm:text-base"
          >
            Sign up
          </Link>
        </Show>
        <Show when="signed-in">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-black shadow-sm">
            <Sparkles className="size-3.5" />
            Pro
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 sm:h-10 sm:w-10",
              },
            }}
          />
        </Show>
      </div>
    </header>
  )
}
