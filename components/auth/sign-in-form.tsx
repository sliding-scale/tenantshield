"use client"

import { useSignIn } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { firstClerkErrorCode, firstClerkErrorMessage } from "@/lib/auth/clerk-errors"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const authFieldClass =
  "h-12 rounded-full border-border bg-popover px-5 text-base shadow-sm placeholder:text-muted-foreground md:text-sm"
type Props = {
  signUpHref: string
  forgotOpen: boolean
  setForgotOpen: (open: boolean) => void
}

export function SignInForm({ signUpHref, forgotOpen, setForgotOpen }: Props) {
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

  const openForgot = async () => {
    setFormError(null)
    setShowNoAccountHint(false)
    await signIn?.reset()
    setForgotOpen(true)
  }

  if (forgotOpen) {
    return (
      <ForgotPasswordForm
        initialEmail={emailAddress}
        onBack={() => {
          void signIn?.reset()
          setForgotOpen(false)
        }}
      />
    )
  }

  if (needsClientTrustCode) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Confirm it&apos;s you</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Enter the code we sent to your email to finish signing in.
          </p>
        </div>
        <form onSubmit={handleVerifyMfa} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="sr-only">
              Verification code
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(ev) => setCode(ev.target.value)}
              placeholder="Verification code"
              className={authFieldClass}
            />
            {errors.fields.code ? (
              <p className="text-sm text-destructive">{errors.fields.code.message}</p>
            ) : null}
          </div>
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <Button
            type="submit"
            variant="cta"
            disabled={fetchStatus === "fetching"}
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            Verify
          </Button>
        </form>
        <div className="flex flex-wrap gap-4 text-sm">
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            onClick={() => void signIn?.mfa.sendEmailCode()}
          >
            Resend code
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={resetFlow}
          >
            Start over
          </button>
        </div>
      </div>
    )
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={emailAddress}
          onChange={(ev) => setEmailAddress(ev.target.value)}
          required
          placeholder="Email"
          className={authFieldClass}
        />
        {errors.fields.identifier ? (
          <p className="text-sm text-destructive">{errors.fields.identifier.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
          placeholder="Password"
          className={authFieldClass}
        />
        {errors.fields.password ? (
          <p className="text-sm text-destructive">{errors.fields.password.message}</p>
        ) : null}
        <div className="flex flex-row items-center justify-between gap-3 pt-0.5">
          <button
            type="button"
            onClick={() => void openForgot()}
            className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            Forgot password?
          </button>
          <Link
            href={signUpHref}
            className="shrink-0 text-sm font-semibold text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            Create account
          </Link>
        </div>
      </div>
      {showNoAccountHint ? (
        <p className="text-sm text-muted-foreground">
          No account found for this email.{" "}
          <Link href={signUpHref} className="font-semibold text-foreground underline underline-offset-4">
            Sign up
          </Link>{" "}
          to create one.
        </p>
      ) : null}
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      <Button
        type="submit"
        variant="cta"
        disabled={fetchStatus === "fetching"}
        className="mt-1 h-12 w-full rounded-full text-base font-semibold"
      >
        Sign in
      </Button>
    </form>
  )
}
