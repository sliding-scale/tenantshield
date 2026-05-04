"use client"

import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { SignInForm } from "@/components/auth/sign-in-form"

export default function LoginPage() {
  const { isLoaded } = useAuth()
  const searchParams = useSearchParams()
  const type = searchParams.get("type")
  const signUpHref = type ? `/signup?type=${encodeURIComponent(type)}` : "/signup"

  if (!isLoaded) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        aria-busy="true"
        aria-live="polite"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading sign in...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with email and password or Google.
        </p>
        <div className="mt-6">
          <SignInForm signUpHref={signUpHref} />
        </div>
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <GoogleOAuthButton mode="sign-in" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href={signUpHref} className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
