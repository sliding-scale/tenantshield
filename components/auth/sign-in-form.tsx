"use client"

import { useSignIn } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { firstClerkErrorCode, firstClerkErrorMessage } from "@/lib/auth/clerk-errors"

type Props = {
  signUpHref: string
}

export function SignInForm({ signUpHref }: Props) {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [needsClientTrustCode, setNeedsClientTrustCode] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showNoAccountHint, setShowNoAccountHint] = useState(false)

  const resetFlow = async () => {
    await signIn?.reset()
    setNeedsClientTrustCode(false)
    setCode("")
    setFormError(null)
    setShowNoAccountHint(false)
  }

  const finalizeSignIn = async () => {
    if (!signIn) return
    const { error } = await signIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) return
        const url = decorateUrl("/dashboard")
        if (url.startsWith("http")) {
          window.location.href = url
        } else {
          router.push(url)
        }
      },
    })
    if (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setShowNoAccountHint(false)

    if (!signIn) return
    if (!emailAddress.trim() || !password) {
      setFormError("Enter email and password.")
      return
    }

    const { error: signInError } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    })

    if (signInError) {
      console.error(signInError)
      if (firstClerkErrorCode(signInError) === "form_identifier_not_found") {
        setShowNoAccountHint(true)
        return
      }
      setFormError(firstClerkErrorMessage(signInError) ?? "Sign-in failed.")
      return
    }

    if (signIn.status === "complete") {
      await finalizeSignIn()
      return
    }

    if (signIn.status === "needs_second_factor") {
      setFormError(
        "Additional verification is required. Use another sign-in method or contact support.",
      )
      return
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      )
      if (emailCodeFactor) {
        const { error: mfaErr } = await signIn.mfa.sendEmailCode()
        if (mfaErr) {
          setFormError(firstClerkErrorMessage(mfaErr) ?? "Could not send verification code.")
          return
        }
        setNeedsClientTrustCode(true)
        return
      }
      setFormError("Additional verification is required.")
      return
    }

    setFormError("Sign-in could not be completed. Try again.")
    console.error("Sign-in attempt not complete:", signIn.status)
  }

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!signIn) return

    const { error } = await signIn.mfa.verifyEmailCode({ code })
    if (error) {
      console.error(error)
      setFormError(firstClerkErrorMessage(error) ?? "Invalid code.")
      return
    }

    if (signIn.status === "complete") {
      await finalizeSignIn()
    } else {
      console.error("Sign-in attempt not complete. Status:", signIn.status)
      setFormError("Sign-in incomplete.")
    }
  }

  if (needsClientTrustCode) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl tracking-tight">Confirm it’s you</h2>
        <p className="text-sm text-muted-foreground">
          Enter the code we sent to your email to finish signing in.
        </p>
        <form onSubmit={handleVerifyMfa} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="text-sm font-medium">
              Verification code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(ev) => setCode(ev.target.value)}
              className="h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.fields.code ? (
              <p className="text-sm text-destructive">{errors.fields.code.message}</p>
            ) : null}
          </div>
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <button
            type="submit"
            disabled={fetchStatus === "fetching"}
            className="h-11 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Verify
          </button>
        </form>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => void signIn?.mfa.sendEmailCode()}
          >
            Resend code
          </button>
          <button type="button" className="text-muted-foreground hover:text-foreground" onClick={resetFlow}>
            Start over
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={emailAddress}
          onChange={(ev) => setEmailAddress(ev.target.value)}
          required
          className="h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.fields.identifier ? (
          <p className="text-sm text-destructive">{errors.fields.identifier.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
          className="h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.fields.password ? (
          <p className="text-sm text-destructive">{errors.fields.password.message}</p>
        ) : null}
      </div>
      {showNoAccountHint ? (
        <p className="text-sm text-muted-foreground">
          No account found for this email.{" "}
          <Link href={signUpHref} className="font-medium text-primary hover:underline">
            Sign up
          </Link>{" "}
          to create one.
        </p>
      ) : null}
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      <button
        type="submit"
        disabled={fetchStatus === "fetching"}
        className="h-11 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        Sign in
      </button>
    </form>
  )
}
