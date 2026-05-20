"use client";

import { Show, UserButton, useAuth, useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { NavbarLogo } from "@/components/shared/navbar-logo";
import { usePathname } from "next/navigation";
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api";
import { planDisplayLabel } from "@/lib/plans/plan-access";
import { cn } from "@/lib/utils";
import { isAuthPagePath, shouldHideTopNavbarOnMobile } from "@/lib/nav/visibility";
import LandingNavbar from "@/components/shared/landing-navbar";
import { Button } from "@/components/ui/button";

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

  if (pathname === "/") {
    return <LandingNavbar />;
  }

  const hideOnMobile = shouldHideTopNavbarOnMobile(pathname, Boolean(isSignedIn));
  const hideOnDesktop = Boolean(isSignedIn);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-card shadow-sm",
        hideOnMobile && "max-md:hidden",
        hideOnDesktop && "md:hidden",
      )}
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:min-h-[4.25rem] sm:gap-6 sm:px-6 lg:min-h-[4.5rem]">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <NavbarLogo priority />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Show when="signed-out">
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
