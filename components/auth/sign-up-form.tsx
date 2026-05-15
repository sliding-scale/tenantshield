"use client"

import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { firstClerkErrorMessage } from "@/lib/auth/clerk-errors"
import { splitFullName } from "@/lib/auth/signup-metadata"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { US_STATES, US_STATE_NAMES } from "@/lib/constants/us-states"

const authFieldClass =
  "h-12 rounded-full border-border bg-popover px-5 text-base shadow-sm placeholder:text-muted-foreground md:text-sm"

type Props = {
  unsafeMetadata?: Record<string, unknown>
}

export function SignUpForm({ unsafeMetadata }: Props) {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [state, setState] = useState("")
  const [code, setCode] = useState("")
  const [awaitingEmailCode, setAwaitingEmailCode] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const resetFlow = async () => {
    await signUp?.reset()
    setAwaitingEmailCode(false)
    setCode("")
    setFormError(null)
  }

  const finalizeSignUp = async () => {
    if (!signUp) return
    const { error } = await signUp.finalize({
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

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!signUp) return
    if (!fullName.trim()) {
      setFormError("Enter your full name.")
      return
    }
    if (!emailAddress.trim() || !password) {
      setFormError("Enter email and password.")
      return
    }

    const { firstName, lastName } = splitFullName(fullName)

    const { error: signUpError } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
      firstName,
      lastName,
      unsafeMetadata: { ...unsafeMetadata, ...(state ? { state } : {}) },
    })

    if (signUpError) {
      console.error(signUpError)
      setFormError(firstClerkErrorMessage(signUpError) ?? "Could not start sign-up.")
      return
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode()
    if (sendError) {
      setFormError(firstClerkErrorMessage(sendError) ?? "Could not send verification email.")
      return
    }

    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address") &&
      signUp.missingFields.length === 0
    ) {
      setAwaitingEmailCode(true)
      return
    }

    if (signUp.status === "complete") {
      await finalizeSignUp()
      return
    }

    setAwaitingEmailCode(true)
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!signUp) return

    const { error } = await signUp.verifications.verifyEmailCode({ code })
    if (error) {
      console.error(error)
      setFormError(firstClerkErrorMessage(error) ?? "Invalid code.")
      return
    }

    if (signUp.status === "complete") {
      await finalizeSignUp()
    } else if (signUp.status === "missing_requirements") {
      router.push("/login/continue")
    } else {
      console.error("Sign-up attempt not complete. Status:", signUp.status)
      setFormError("Sign-up incomplete.")
    }
  }

  if (awaitingEmailCode) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Verify your email</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent a code to {emailAddress.trim()}. Enter it below to finish creating your account.
          </p>
        </div>
        <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signup-code" className="sr-only">
              Verification code
            </label>
            <Input
              id="signup-code"
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
            onClick={() => void signUp?.verifications.sendEmailCode()}
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
        <div id="clerk-captcha" />
      </div>
    )
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="sr-only">
          Full name
        </label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(ev) => setFullName(ev.target.value)}
          required
          placeholder="Full name"
          className={authFieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-email" className="sr-only">
          Email
        </label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          value={emailAddress}
          onChange={(ev) => setEmailAddress(ev.target.value)}
          required
          placeholder="Email"
          className={authFieldClass}
        />
        {errors.fields.emailAddress ? (
          <p className="text-sm text-destructive">{errors.fields.emailAddress.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-password" className="sr-only">
          Password
        </label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
          placeholder="Password (6+ characters)"
          className={authFieldClass}
        />
        {errors.fields.password ? (
          <p className="text-sm text-destructive">{errors.fields.password.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-state" className="sr-only">
          Your state
        </label>
        <select
          id="signup-state"
          name="state"
          value={state}
          onChange={(ev) => setState(ev.target.value)}
          className={`${authFieldClass} appearance-none`}
        >
          <option value="">State (optional)</option>
          {US_STATES.map((abbr) => (
            <option key={abbr} value={abbr}>
              {US_STATE_NAMES[abbr]} ({abbr})
            </option>
          ))}
        </select>
      </div>
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      <Button
        type="submit"
        variant="cta"
        disabled={fetchStatus === "fetching"}
        className="mt-1 h-12 w-full rounded-full text-base font-semibold"
      >
        Create My Shield
      </Button>
      <div id="clerk-captcha" />
    </form>
  )
}
