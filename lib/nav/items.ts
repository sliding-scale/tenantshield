import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  Building2,
  CreditCard,
  FileSearch,
  FileText,
  MessageSquareShare,
  PlusCircle,
  Scale,
  Shield,
  Sparkles,
  Star,
  UserRound,
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
    href: "/ask-ai",
    label: "Ask AI",
    Icon: Sparkles,
    matches: (pathname) => pathname.toLowerCase().startsWith("/ask-ai"),
  },
  {
    href: "/leases",
    label: "Leases",
    Icon: FileSearch,
    matches: (pathname) => pathname.startsWith("/leases"),
    hideOnMobile: true,
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

/** Overflow links opened from the mobile tab bar hamburger menu. */
export const MOBILE_MORE_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/ratings",
    label: "Ratings",
    Icon: Star,
    matches: (pathname) => pathname.startsWith("/ratings"),
  },
  {
    href: "/leases",
    label: "Leases",
    Icon: FileSearch,
    matches: (pathname) => pathname.startsWith("/leases"),
  },
  {
    href: "/analyze-lease",
    label: "Analyze Lease",
    Icon: MessageSquareShare,
    matches: (pathname) => pathname.startsWith("/analyze-lease"),
  },
  {
    href: "/newcase",
    label: "New Case",
    Icon: PlusCircle,
    matches: (pathname) => pathname.startsWith("/newcase"),
  },
  {
    href: "/state-laws",
    label: "State Laws",
    Icon: Scale,
    matches: (pathname) => pathname.startsWith("/state-laws"),
  },
  {
    href: "/billing",
    label: "Billing",
    Icon: CreditCard,
    matches: (pathname) => pathname.startsWith("/billing"),
  },
]

export function isMobileMoreNavActive(pathname: string) {
  return MOBILE_MORE_NAV_ITEMS.some((item) => item.matches(pathname))
}

/** Admin mobile tab bar — matches desktop navbar admin links. */
export const ADMIN_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/admin/users",
    label: "Users",
    Icon: UserRound,
    matches: (pathname) =>
      pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
  },
  {
    href: "/admin/properties",
    label: "Properties",
    Icon: Building2,
    matches: (pathname) =>
      pathname === "/admin/properties" ||
      pathname.startsWith("/admin/properties/"),
  },
]

