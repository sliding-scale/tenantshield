"use client"

import { useAuth } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import {
  ADMIN_NAV_ITEMS,
  APP_NAV_ITEMS,
  type AppNavItem,
  isMobileMoreNavActive,
  MOBILE_MORE_NAV_ITEMS,
} from "@/lib/nav/items"
import { shouldShowMobileTabBar } from "@/lib/nav/visibility"
import { MOBILE_TAB_BAR_HEIGHT } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

function NavTab({
  href,
  label,
  Icon,
  active,
  onNavigate,
}: {
  href: string
  label: string
  Icon: AppNavItem["Icon"]
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[0.7rem] font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
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
}

export default function MobileTabBar() {
  const pathname = usePathname() ?? ""
  const { isSignedIn, isLoaded } = useAuth()
  const { role } = useCurrentUser()
  const isAdmin = role === "admin"
  const tabItems = isAdmin ? ADMIN_NAV_ITEMS : APP_NAV_ITEMS.filter((item) => !item.hideOnMobile)
  const [menuOpen, setMenuOpen] = useState(false)
  const moreActive = !isAdmin && isMobileMoreNavActive(pathname)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isAdmin) setMenuOpen(false)
  }, [isAdmin])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  if (!isLoaded || !shouldShowMobileTabBar(pathname, Boolean(isSignedIn))) {
    return null
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <TabBarSpacer />
      {menuOpen && !isAdmin ? (
        <button
          type="button"
          className="fixed inset-0 z-[110] bg-foreground/20 md:hidden"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}
      {menuOpen && !isAdmin ? (
        <div
          id="mobile-more-menu"
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
          className="fixed inset-x-0 z-[120] md:hidden"
          style={{ bottom: MOBILE_TAB_BAR_HEIGHT }}
        >
          <div className="mx-auto max-w-lg border-t border-border bg-background px-3 py-3 shadow-lg">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              More
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {MOBILE_MORE_NAV_ITEMS.map(({ href, label, Icon, matches }) => {
                const active = matches(pathname)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={closeMenu}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "border-border bg-muted text-foreground"
                          : "border-transparent bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5 shrink-0",
                          active ? "text-foreground" : "text-muted-foreground",
                        )}
                        strokeWidth={active ? 2.35 : 1.5}
                        aria-hidden
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : null}
      <nav
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {tabItems.map(({ href, label, Icon, matches }) => (
            <NavTab
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={matches(pathname)}
            />
          ))}
          {!isAdmin ? (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            aria-controls="mobile-more-menu"
            className={cn(
              "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[0.7rem] font-medium transition-colors",
              moreActive || menuOpen
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {menuOpen ? (
              <X className="size-6 shrink-0 text-foreground" strokeWidth={2.35} aria-hidden />
            ) : (
              <Menu
                className={cn(
                  "size-6 shrink-0",
                  moreActive ? "text-foreground" : "text-muted-foreground",
                )}
                strokeWidth={moreActive ? 2.35 : 1.5}
                aria-hidden
              />
            )}
            <span className="truncate">More</span>
          </button>
          ) : null}
        </div>
      </nav>
    </>
  )
}

function TabBarSpacer() {
  return (
    <div
      className="shrink-0 md:hidden"
      style={{ height: MOBILE_TAB_BAR_HEIGHT }}
      aria-hidden
    />
  )
}
