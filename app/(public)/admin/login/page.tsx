"use client";

import { useAuth } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs";
import { ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";

/**
 * Staff-only sign-in (Clerk custom UI, email + password only).
 * No self-serve signup, OAuth, or password reset — admins are provisioned in Clerk.
 */
export default function AdminLoginPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { role } = useCurrentUser();
  const router = useRouter();
  const [forgotOpen, setForgotOpen] = useState(false);

  const { signIn } = useSignIn();

  useEffect(() => {
    const handlePageShow = () => {
      void signIn?.reset();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [signIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (role === "admin") {
      router.replace("/admin/users");
    } else {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, role, router]);

  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <header className="mb-8 flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-full border-border bg-popover shadow-sm"
              asChild
            >
              <Link href="/" aria-label="Back to home">
                <ChevronLeft
                  className="size-5 text-foreground"
                  strokeWidth={1.75}
                />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield
                className="size-6 shrink-0 text-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
                TenantShield
              </span>
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Admin
              </span>
            </div>
          </header>

          <main className="flex w-full flex-col">
            <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2.5rem]">
              Admin sign in
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Authorized staff only. Sign in with your work email and password.
            </p>
            <div className="mt-8 flex flex-col gap-6">
              <SignInForm
                forgotOpen={forgotOpen}
                setForgotOpen={setForgotOpen}
                redirectTo="/dashboard"
                allowForgotPassword={false}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
