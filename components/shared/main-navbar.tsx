"use client";

import { Show, UserButton, useAuth, useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
<<<<<<< HEAD
import { Sparkles } from "lucide-react";
=======
import { Menu, Sparkles } from "lucide-react";
import Image from "next/image";
>>>>>>> c1b356a6b729e07b614112749a0cda5244f518ee
import Link from "next/link";
import { NavbarLogo } from "@/components/shared/navbar-logo";
import { usePathname } from "next/navigation";
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api";
import { planDisplayLabel } from "@/lib/plans/plan-access";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import { isAuthPagePath } from "@/lib/nav/visibility";
import LandingNavbar from "@/components/shared/landing-navbar";
=======
import { isAuthPagePath, shouldHideTopNavbarOnMobile } from "@/lib/nav/visibility";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const APP_LOGO_SRC =
  "/vecteezy_stylized-yellow-shield-icon-flat-design_54786290.png";
>>>>>>> c1b356a6b729e07b614112749a0cda5244f518ee

const LANDING_MENU_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const billing = useQuery(api.planUsage.queries.current, clerkUser ? {} : "skip");
  const { convexUser, isLoading, role } = useCurrentUser();

  const planLabel =
    role === "admin"
      ? "Admin"
      : planDisplayLabel(billing?.plan ?? convexUser?.plan);

  if (isAuthPagePath(pathname)) {
    return null;
  }

<<<<<<< HEAD
  if (pathname === "/") {
    return <LandingNavbar />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-amber-200 bg-white shadow-sm">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-2 sm:min-h-[4.25rem] sm:gap-6 sm:px-6 lg:min-h-[4.5rem]">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <NavbarLogo priority />
=======
  const hideOnMobile = shouldHideTopNavbarOnMobile(pathname, Boolean(isSignedIn));
  const hideOnDesktop = Boolean(isSignedIn);
  const showLandingNav = pathname === "/" && !isSignedIn;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-card shadow-sm",
        hideOnMobile && "max-md:hidden",
        hideOnDesktop && "md:hidden",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6 lg:gap-10">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 font-heading text-lg font-bold tracking-tight text-foreground sm:gap-2.5 sm:text-xl"
          >
            <Image
              src={APP_LOGO_SRC}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 object-contain sm:size-9"
              priority
            />
            <span>TenantShield</span>
>>>>>>> c1b356a6b729e07b614112749a0cda5244f518ee
          </Link>

          {showLandingNav ? (
            <nav className="hidden items-center gap-8 md:flex">
              {LANDING_MENU_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Show when="signed-out">
            {showLandingNav ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-full border-border bg-card md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {LANDING_MENU_LINKS.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <a href={link.href}>{link.label}</a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <Button variant="default" className="h-10 rounded-full px-4 sm:px-5" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            {!isLoading ? (
              <Link href="/billing">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                <Sparkles className="size-3.5" />
                {planLabel}
              </span>
              </Link>
            ) : null}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 sm:h-10 sm:w-10",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}
