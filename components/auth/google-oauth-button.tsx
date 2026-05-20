"use client"

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Google } from "@/components/ui/svgs/google"

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

  const onClick = async () => {
    if (!clerk.loaded) return

    if (props.mode === "sign-in") {
      if (!signIn) return
      // Clear any in-progress identifier/password attempt so OAuth doesn't inherit needs_identifier.
      await signIn.reset()

      const metadata = props.unsafeMetadata
      const hasMetadata =
        metadata !== undefined && metadata !== null && Object.keys(metadata).length > 0

      // Helper to attempt sign-up, but fallback to sign-in if user exists
      const trySignUpThenSignIn = async () => {
        if (!signUp) return
        setPending(true)
        const { error } = await signUp.sso({
          strategy: "oauth_google",
          redirectCallbackUrl: SSO_CALLBACK,
          redirectUrl: AFTER_AUTH,
          unsafeMetadata: metadata,
        })
        setPending(false)

        if (error) {
          const code = "code" in error && typeof error.code === "string" ? error.code : ""
          // Clerk may reject sign-up when the account already exists; fall back to sign-in.
          if (code === "form_identifier_exists" || code === "identifier_already_signed_up") {
            if (!signIn) return
            await signIn.reset()
            setPending(true)
            const { error: signInErr } = await signIn.sso({
              strategy: "oauth_google",
              redirectCallbackUrl: SSO_CALLBACK,
              redirectUrl: AFTER_AUTH,
            })
            setPending(false)
            if (signInErr) {
              console.error(signInErr)
              return
            }
            if (
              signIn.status !== "complete" &&
              signIn.status !== "needs_second_factor" &&
              signIn.status !== "needs_client_trust"
            ) {
              console.error("Sign-in (OAuth fallback) not complete:", signIn.status)
            }
            return
          }
          console.error(error)
          return
        }
        if (signUp.status !== "complete") {
          console.error("Sign-in (OAuth via sign-up) not complete:", signUp.status)
        }
      }

      if (hasMetadata) {
        await trySignUpThenSignIn()
        return
      }

      setPending(true)
      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: SSO_CALLBACK,
        redirectUrl: AFTER_AUTH,
      })
      setPending(false)
      if (error) {
        console.error(error)
        return
      }
      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        return
      }
      if (signIn.status !== "complete") {
        console.error("Sign-in attempt not complete:", signIn.status)
      }
      return
    }

    if (!signUp) return
    await signUp.reset()
    setPending(true)
    const { error } = await signUp.sso({
      strategy: "oauth_google",
      redirectCallbackUrl: SSO_CALLBACK,
      redirectUrl: AFTER_AUTH,
      unsafeMetadata: props.unsafeMetadata,
    })
    setPending(false)
    if (error) {
      console.error(error)
      return
    }
    if (signUp.status !== "complete") {
      console.error("Sign-up OAuth not complete:", signUp.status)
    }
  }

  const needsSignIn = props.mode === "sign-in" && !(props.unsafeMetadata && Object.keys(props.unsafeMetadata).length > 0)
  const needsSignUp = props.mode === "sign-up" || (props.mode === "sign-in" && !!props.unsafeMetadata && Object.keys(props.unsafeMetadata).length > 0)
  const disabled =
    !clerk.loaded || pending || (needsSignIn && !signIn) || (needsSignUp && !signUp)

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={() => void onClick()}
      className="h-12 w-full gap-2 rounded-full border-border bg-popover px-4 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground sm:text-base"
    >
      <Google className="size-5 shrink-0" aria-hidden />
      {pending ? "Connecting…" : "Continue with Google"}
    </Button>
  )
}
