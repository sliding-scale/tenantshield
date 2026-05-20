"use client"

import Image from "next/image"
import Link from "next/link"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { NavAppLinks } from "@/components/nav-app-links"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  ADMIN_NAV_ITEMS,
  APP_NAV_ITEMS,
  MOBILE_MORE_NAV_ITEMS,
  type AppNavItem,
} from "@/lib/nav/items"

const APP_LOGO_SRC =
  "/vecteezy_stylized-yellow-shield-icon-flat-design_54786290.png"

const SIDEBAR_EXCLUDED_HREFS = new Set(["/billing", "/profile"])

const moreNavItems: AppNavItem[] = MOBILE_MORE_NAV_ITEMS.filter(
  (item) =>
    !APP_NAV_ITEMS.some((main) => main.href === item.href) &&
    !SIDEBAR_EXCLUDED_HREFS.has(item.href),
)

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = useCurrentUser()

  const isAdmin = role === "admin"
  const navItems = (isAdmin ? ADMIN_NAV_ITEMS : APP_NAV_ITEMS).filter(
    (item) => !SIDEBAR_EXCLUDED_HREFS.has(item.href),
  )
  const homeHref = isAdmin ? "/admin/users" : "/dashboard"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeHref}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src={APP_LOGO_SRC}
                    alt=""
                    width={32}
                    height={32}
                    className="size-7 object-contain"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-heading font-semibold">TenantShield</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavAppLinks items={navItems} />
        {!isAdmin && moreNavItems.length > 0 ? (
          <>
            <SidebarSeparator />
            <NavAppLinks label="More" items={moreNavItems} />
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
