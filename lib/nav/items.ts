import type { LucideIcon } from "lucide-react"
import { Briefcase, FileText, Shield, Sparkles, UserRound } from "lucide-react"

export type AppNavItem = {
  href: string
  label: string
  Icon: LucideIcon
  matches: (pathname: string) => boolean
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    Icon: Shield,
    matches: (pathname) =>
      pathname === "/" || pathname === "/dashboard" || pathname === "/dashboard/",
  },
  {
    href: "/cases",
    label: "Cases",
    Icon: Briefcase,
    matches: (pathname) => pathname.startsWith("/cases"),
  },
  {
    href: "/ai",
    label: "AI",
    Icon: Sparkles,
    matches: (pathname) => pathname.startsWith("/ai"),
  },
  {
    href: "/letters",
    label: "Letters",
    Icon: FileText,
    matches: (pathname) => pathname.startsWith("/letters"),
  },
  {
    href: "/profile",
    label: "Profile",
    Icon: UserRound,
    matches: (pathname) => pathname.startsWith("/profile"),
  },
]

