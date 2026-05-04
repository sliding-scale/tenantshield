"use client"

import { Show, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import useCurrentUser from "@/app/hooks/useCurrentUser"

function isAuthPagePath(pathname: string | null) {
  if (!pathname) return false
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/sso-callback" ||
    pathname.startsWith("/sso-callback/")
  )
}

export default function Navbar() {
  const pathname = usePathname()
  if (isAuthPagePath(pathname)) {
    return null
  }
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-4 sm:gap-6 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
        <Link
          href="/"
          className="shrink-0 font-heading text-lg tracking-tight text-foreground sm:text-xl md:text-2xl"
        >
          TenantShield
        </Link>
        <Show when="signed-in">
          {/* <SignedInNavLinks /> */}
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
