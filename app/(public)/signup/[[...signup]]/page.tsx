"use client"

import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { signupMetadataFromType } from "@/lib/auth/signup-metadata"

export default function SignUpPage() {
  const { isLoaded } = useAuth()
  const searchParams = useSearchParams()
  const type = searchParams.get("type")
  const unsafeMetadata = signupMetadataFromType(type)
  const signInHref = type ? `/login?type=${encodeURIComponent(type)}` : "/login"

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
        <p className="text-sm text-muted-foreground">Loading sign up...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground sm:absolute sm:left-6 sm:top-6"
      >
        ← Back to home
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your details, then we&apos;ll email you a code to verify your address. Or use Google.
        </p>
        <div className="mt-6">
          <SignUpForm unsafeMetadata={unsafeMetadata} />
        </div>
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <GoogleOAuthButton mode="sign-up" unsafeMetadata={unsafeMetadata} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={signInHref} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
