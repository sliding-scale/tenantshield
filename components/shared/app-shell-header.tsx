"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

/** Desktop-only top bar with sidebar collapse toggle. */
export function AppShellHeader() {
  return (
    <header className="hidden h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:flex">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
    </header>
  )
}
