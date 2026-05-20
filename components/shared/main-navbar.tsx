"use client";

import { Show, UserButton, useAuth, useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { api } from "@/convex/_generated/api";
import { APP_NAV_ITEMS } from "@/lib/nav/items";
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-amber-200 bg-white shadow-sm",
        hideOnMobile && "max-md:hidden",
      )}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 font-heading text-lg font-bold tracking-tight text-gray-900 sm:gap-2.5 sm:text-xl"
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
          <Show when="signed-in">
            <nav className="ml-1 hidden items-center gap-1 lg:flex">
              {role === "admin"
                ? [
                    { href: "/admin/users", label: "Users" },
                    { href: "/admin/properties", label: "Properties" },
                  ].map(({ href, label }) => {
                    const active =
                      pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "rounded-full px-3 py-2 text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-amber-100 text-amber-700"
                            : "text-gray-600 hover:text-amber-600",
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })
                : APP_NAV_ITEMS.map(({ href, label, matches }) => {
                    const active = matches(pathname ?? "");
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "rounded-full px-3 py-2 text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-amber-100 text-amber-700"
                            : "text-gray-600 hover:text-amber-600",
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
            </nav>
          </Show>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Show when="signed-out">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-amber-500 hover:text-amber-600 active:scale-95 sm:px-5"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-full bg-amber-500 px-4 text-sm font-bold text-white transition-all duration-200 hover:bg-amber-600 active:scale-95 shadow-md hover:shadow-lg sm:px-5"
            >
              Sign up
            </Link>
          </Show>
          <Show when="signed-in">
            {!isLoading ? (
              <Link href="/billing">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
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
