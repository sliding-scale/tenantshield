"use client"

import { useAuth } from "@clerk/nextjs"
import { ChevronLeft, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"
import { SignInForm } from "@/components/auth/sign-in-form"
import { signupMetadataFromType } from "@/lib/auth/signup-metadata"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useSignIn, useSignUp } from "@clerk/nextjs"

export default function LoginPage() {
  const { isLoaded } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type")
  const unsafeMetadata = signupMetadataFromType(type)
  const signUpHref = type ? `/signup?type=${encodeURIComponent(type)}` : "/signup"
  const [forgotOpen, setForgotOpen] = useState(false)
  
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
        signIn?.reset()
        signUp?.reset()
    }
    window.addEventListener("pageshow", handlePageShow)

    return () => {
      window.removeEventListener("pageshow", handlePageShow)
    }
  }, [signIn, signUp])

  // if (!isLoaded) {
  //   return (
  //     <div
  //       className="flex min-h-screen flex-col items-center justify-center gap-4"
  //       aria-busy="true"
  //       aria-live="polite"
  //     >
  //       <div
  //         className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
  //         aria-hidden
  //       />
  //       <p className="text-sm text-muted-foreground">Loading sign in...</p>
  //     </div>
  //   )
  // }

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
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
                <ChevronLeft className="size-5 text-foreground" strokeWidth={1.75} />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="size-6 shrink-0 text-foreground" strokeWidth={1.5} aria-hidden />
              <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
                TenantShield
              </span>
            </div>
          </header>

          <main className="flex w-full flex-col">
            <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2.5rem]">
              Welcome back.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Your rights, your shield. Log in to continue.
            </p>
            <div className="mt-8 flex flex-col gap-6">
              <SignInForm
                signUpHref={signUpHref}
                forgotOpen={forgotOpen}
                setForgotOpen={setForgotOpen}
              />
              {!forgotOpen ? (
                <>
                  <div className="relative py-1" role="separator">
                    <div className="absolute inset-0 flex items-center" aria-hidden>
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      <span className="bg-background px-3">Or</span>
                    </div>
                  </div>
                  <GoogleOAuthButton
                    mode="sign-in"
                    unsafeMetadata={unsafeMetadata}
                  />
                </>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
