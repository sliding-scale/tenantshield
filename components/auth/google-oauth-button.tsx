"use client"

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useState } from "react"

const SSO_CALLBACK = "/sso-callback"
const AFTER_AUTH = "/dashboard"

type GoogleAuthButtonSignIn = {
  mode: "sign-in"
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
      if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
        return
      }
      if (signIn.status !== "complete") {
        console.error("Sign-in attempt not complete:", signIn.status)
      }
      return
    }

    if (!signUp) return
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

  const disabled = !clerk.loaded || pending || (props.mode === "sign-in" ? !signIn : !signUp)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-card/90 disabled:pointer-events-none disabled:opacity-50 sm:h-12 sm:text-base"
    >
      <GoogleGlyph />
      {pending ? "Connecting…" : "Continue with Google"}
    </button>
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
