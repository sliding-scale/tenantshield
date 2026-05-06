"use client"

import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { APP_NAV_ITEMS } from "@/lib/nav/items"
import { cn } from "@/lib/utils"
import { shouldShowMobileTabBar } from "@/lib/nav/visibility"

export default function MobileTabBar() {
  const pathname = usePathname() ?? ""
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded || !shouldShowMobileTabBar(pathname, Boolean(isSignedIn))) {
    return null
  }

  return (
    <>
      {/* Reserve space so fixed bar does not cover content */}
      <div
        className="shrink-0 md:hidden"
        style={{
          height: "calc(3.75rem + env(safe-area-inset-bottom, 0px))",
        }}
        aria-hidden
      />
      <nav
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {APP_NAV_ITEMS.map(({ href, label, Icon, matches }) => {
            const active = matches(pathname)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[0.7rem] font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80",
                )}
              >
                <Icon
                  className={cn(
                    "size-6 shrink-0",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                  strokeWidth={active ? 2.35 : 1.5}
                  aria-hidden
                />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
