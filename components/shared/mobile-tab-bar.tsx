"use client"

import { SignOutButton, useAuth } from "@clerk/nextjs"
import { LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import {
  ADMIN_NAV_ITEMS,
  MOBILE_TAB_BAR_ITEMS,
  type AppNavItem,
  isMobileMoreNavActive,
} from "@/lib/nav/items"
import {
  shouldShowMobileTabBar,
  shouldShowMobileTabBarSpacer,
} from "@/lib/nav/visibility"
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

const tabBarActionClass =
  "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[0.7rem] font-medium transition-colors"

function AdminMoreTab() {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close more menu" : "Open more menu"}
          className={cn(
            tabBarActionClass,
            open ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
          )}
        >
          <Menu
            className={cn(
              "size-6 shrink-0",
              open ? "text-foreground" : "text-muted-foreground",
            )}
            strokeWidth={open ? 2.35 : 1.5}
            aria-hidden
          />
          <span className="truncate">More</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center" className="z-110 min-w-40">
        <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => event.preventDefault()}
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function MobileTabBar() {
  const pathname = usePathname() ?? ""
  const { isSignedIn, isLoaded } = useAuth()
  const { role } = useCurrentUser()
  const { toggleSidebar, openMobile, setOpenMobile } = useSidebar()
  const isAdmin = role === "admin"
  const tabItems = isAdmin ? ADMIN_NAV_ITEMS : MOBILE_TAB_BAR_ITEMS
  const moreActive = !isAdmin && (isMobileMoreNavActive(pathname) || openMobile)

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  if (!isLoaded || !shouldShowMobileTabBar(pathname, Boolean(isSignedIn))) {
    return null
  }

  const closeSidebar = () => setOpenMobile(false)
  const showSpacer = shouldShowMobileTabBarSpacer(pathname, Boolean(isSignedIn))

  return (
    <>
      {showSpacer ? <TabBarSpacer /> : null}
      <nav
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-card md:hidden"
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
              onNavigate={closeSidebar}
            />
          ))}
          {isAdmin ? (
            <AdminMoreTab />
          ) : (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-expanded={openMobile}
              aria-label={openMobile ? "Close navigation menu" : "Open navigation menu"}
              className={cn(
                tabBarActionClass,
                moreActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {openMobile ? (
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
          )}
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
