import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  CreditCard,
  FileSearch,
  FileText,
  Shield,
  Sparkles,
  UserRound,
  Scale,
} from "lucide-react"

export type AppNavItem = {
  href: string
  label: string
  Icon: LucideIcon
  matches: (pathname: string) => boolean
  hideOnMobile?: boolean
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
  // {
  //   href: "/ai",
  //   label: "AI",
  //   Icon: Sparkles,
  //   matches: (pathname) => pathname.startsWith("/ai"),
  // },
  {
    href: "/letters",
    label: "Letters",
    Icon: FileText,
    matches: (pathname) => pathname.startsWith("/letters"),
  },
  {
    href: "/leases",
    label: "Leases",
    Icon: FileSearch,
    matches: (pathname) => pathname.startsWith("/leases"),
  },
  {
    href: "/state-laws",
    label: "Laws",
    Icon: Scale,
    matches: (pathname) => pathname.startsWith("/state-laws"),
    hideOnMobile: true,
  },
  {
    href: "/billing",
    label: "Billing",
    Icon: CreditCard,
    matches: (pathname) => pathname.startsWith("/billing"),
    hideOnMobile: true,
  },
  {
    href: "/profile",
    label: "Profile",
    Icon: UserRound,
    matches: (pathname) => pathname.startsWith("/profile"),
  },
]

