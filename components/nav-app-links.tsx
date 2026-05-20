"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { AppNavItem } from "@/lib/nav/items"

type NavAppLinksProps = {
  label?: string
  items: AppNavItem[]
}

export function NavAppLinks({ label = "Navigation", items }: NavAppLinksProps) {
  const pathname = usePathname() ?? ""

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(({ href, label: itemLabel, Icon, matches }) => {
          const active = matches(pathname)
          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={active} tooltip={itemLabel}>
                <Link href={href}>
                  <Icon strokeWidth={active ? 2.35 : 1.75} aria-hidden />
                  <span>{itemLabel}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
