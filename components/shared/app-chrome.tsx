"use client"

import { useAuth } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { AppShellHeader } from "@/components/shared/app-shell-header"
import Navbar from "@/components/shared/main-navbar"
import MobileTabBar from "@/components/shared/mobile-tab-bar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { shouldShowDesktopSidebar } from "@/lib/nav/visibility"

type AppChromeProps = {
  children: React.ReactNode
}

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()
  const showSidebar = isLoaded && shouldShowDesktopSidebar(pathname, Boolean(isSignedIn))

  if (!showSidebar) {
    return (
      <div className="flex min-h-svh flex-col bg-background">
        <Navbar />
        {children}
        <MobileTabBar />
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppShellHeader />
          <Navbar />
          {children}
          <MobileTabBar />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
