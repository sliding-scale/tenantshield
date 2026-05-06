"use client"

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const SSO_CALLBACK = "/sso-callback"
const AFTER_AUTH = "/dashboard"

type GoogleAuthButtonSignIn = {
  mode: "sign-in"
  /** If set, OAuth starts as sign-up so Clerk receives `unsafeMetadata` for newly created users; `/sso-callback` still handles existing accounts. */
  unsafeMetadata?: Record<string, unknown>
}

type GoogleAuthButtonSignUp = {
  mode: "sign-up"
  unsafeMetadata?: Record<string, unknown>
}

export function GoogleOAuthButton(props: GoogleAuthButtonSignIn | GoogleAuthButtonSignUp) {
  const clerk = useClerk()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const clearPending = () => setPending(false)
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        clearPending()
      }
    }

    window.addEventListener("pageshow", clearPending)
    window.addEventListener("focus", clearPending)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("pageshow", clearPending)
      window.removeEventListener("focus", clearPending)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const waitForAuthResources = async () => {
    for (let i = 0; i < 8; i += 1) {
      const hasSignIn = !!signIn
      const hasSignUp = !!signUp
      if (hasSignIn || hasSignUp) return true
      await new Promise((resolve) => setTimeout(resolve, 125))
    }
    return !!signIn || !!signUp
  }

  const onClick = async () => {
    if (!clerk.loaded || pending) return
    setPending(true)
    try {
      const hasAuthResources = await waitForAuthResources()
      if (!hasAuthResources) {
        // Last-resort recovery for stale back/forward restores.
        window.location.reload()
        return
      }

      // Clear any leftover Clerk attempt state from prior failed credential / OAuth tries.
      await Promise.allSettled([signIn?.reset(), signUp?.reset()])

      if (props.mode === "sign-in") {
        const metadata = props.unsafeMetadata
        const hasMetadata =
          metadata !== undefined && metadata !== null && Object.keys(metadata).length > 0

        const trySignUpThenSignIn = async () => {
          if (!signUp) {
            if (!signIn) return
            const { error: signInErr } = await signIn.sso({
              strategy: "oauth_google",
              redirectCallbackUrl: SSO_CALLBACK,
              redirectUrl: AFTER_AUTH,
            })
            if (signInErr) console.error(signInErr)
            return
          }

          const { error } = await signUp.sso({
            strategy: "oauth_google",
            redirectCallbackUrl: SSO_CALLBACK,
            redirectUrl: AFTER_AUTH,
            unsafeMetadata: metadata,
          })

          if (error) {
            const code = "code" in error && typeof error.code === "string" ? error.code : ""
            if (code === "form_identifier_exists" || code === "identifier_already_signed_up") {
              if (!signIn) return
              const { error: signInErr } = await signIn.sso({
                strategy: "oauth_google",
                redirectCallbackUrl: SSO_CALLBACK,
                redirectUrl: AFTER_AUTH,
              })
              if (signInErr) {
                console.error(signInErr)
              }
              return
            }
            console.error(error)
          }
        }

        if (hasMetadata) {
          await trySignUpThenSignIn()
          return
        }

        if (!signIn) return
        const { error } = await signIn.sso({
          strategy: "oauth_google",
          redirectCallbackUrl: SSO_CALLBACK,
          redirectUrl: AFTER_AUTH,
        })
        if (error) {
          console.error(error)
        }
        return
      }

      if (!signUp) return
      const { error } = await signUp.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: SSO_CALLBACK,
        redirectUrl: AFTER_AUTH,
        unsafeMetadata: props.unsafeMetadata,
      })
      if (error) {
        console.error(error)
      }
    } finally {
      setPending(false)
    }
  }

  const disabled = !clerk.loaded || pending

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={() => void onClick()}
      className="h-12 w-full gap-2 rounded-full border-border bg-popover px-4 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground sm:text-base"
    >
      <GoogleGlyph />
      {pending ? "Connecting…" : "Continue with Google"}
    </Button>
  )
}

function GoogleGlyph() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold text-foreground ring-1 ring-border"
      aria-hidden
    >
      G
    </span>
  )
}
