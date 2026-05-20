"use client"

import { useAuth } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { shouldHideTopNavbarOnMobile } from "@/lib/nav/visibility"
import { cn } from "@/lib/utils"

/** Top bar with sidebar toggle — visible on desktop; on mobile when the main navbar is hidden. */
export function AppShellHeader() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()
  const hideNavbarOnMobile = shouldHideTopNavbarOnMobile(pathname, Boolean(isSignedIn))

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4",
        hideNavbarOnMobile ? "flex" : "hidden md:flex",
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
    </header>
  )
}
