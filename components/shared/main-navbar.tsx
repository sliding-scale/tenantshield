"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import { APP_NAV_ITEMS } from "@/lib/nav/items";
import { planDisplayLabel } from "@/lib/plans/plan-access";
import { cn } from "@/lib/utils";
import { isAuthPagePath } from "@/lib/nav/visibility";

export default function Navbar() {
  const pathname = usePathname();
  const { convexUser, isLoading } = useCurrentUser();
  const planLabel = planDisplayLabel(convexUser?.plan);

  if (isAuthPagePath(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-amber-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="shrink-0 font-heading text-lg font-bold tracking-tight text-gray-900 sm:text-xl"
          >
            TenantShield
          </Link>
          <Show when="signed-in">
            <nav className="ml-1 hidden items-center gap-1 lg:flex">
              {APP_NAV_ITEMS.map(({ href, label, matches }) => {
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                <Sparkles className="size-3.5" />
                {planLabel}
              </span>
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
