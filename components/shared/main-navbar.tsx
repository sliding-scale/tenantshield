"use client";

import { Show, UserButton, useAuth, useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api";
import { planDisplayLabel } from "@/lib/plans/plan-access";
import { cn } from "@/lib/utils";
import { isAuthPagePath, shouldHideTopNavbarOnMobile } from "@/lib/nav/visibility";

const APP_LOGO_SRC =
  "/vecteezy_stylized-yellow-shield-icon-flat-design_54786290.png";

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
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
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
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Show when="signed-out">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:px-5"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-5"
            >
              Sign up
            </Link>
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
