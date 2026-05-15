"use client"

import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { firstClerkErrorCode, firstClerkErrorMessage } from "@/lib/auth/clerk-errors"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const authFieldClass =
  "h-12 rounded-full border-border bg-popover px-5 text-base shadow-sm placeholder:text-muted-foreground md:text-sm"

type Props = {
  initialEmail?: string
  onBack: () => void
}

export function ForgotPasswordForm({ initialEmail = "", onBack }: Props) {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState(initialEmail)
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const emailError = errors.fields.identifier?.message ?? formError
  const codeError = errors.fields.code?.message ?? formError
  const passwordError = errors.fields.password?.message ?? formError

  const handleBack = async () => {
    await signIn?.reset()
    setCodeSent(false)
    setCode("")
    setPassword("")
    setFormError(null)
    onBack()
  }

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!signIn) return
    if (!emailAddress.trim()) {
      setFormError("Enter your email address.")
      return
    }

    const { error: createError } = await signIn.create({
      identifier: emailAddress.trim(),
    })
    if (createError) {
      console.error(createError)
      setFormError(firstClerkErrorMessage(createError) ?? "Could not start reset.")
      return
    }

    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode()
    if (sendCodeError) {
      console.error(sendCodeError)
      setFormError(firstClerkErrorMessage(sendCodeError) ?? "Could not send reset code.")
      return
    }

    setCodeSent(true)
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!signIn) return

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code,
    })
    if (error) {
      console.error(error)
      setFormError(firstClerkErrorMessage(error) ?? "Invalid code.")
      return
    }
  }

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!signIn) return

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
    })
    if (error) {
      console.error(error)
      const codeErr = firstClerkErrorCode(error)
      if (codeErr === "form_password_pwned") {
        setFormError("This password is known to be unsafe. Choose a different one.")
        return
      }
      setFormError(firstClerkErrorMessage(error) ?? "Could not update password.")
      return
    }

    if (signIn.status === "complete") {
      const { error: finErr } = await signIn.finalize({
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
      if (finErr) {
        console.error(finErr)
        setFormError(firstClerkErrorMessage(finErr) ?? "Could not finish sign-in.")
      }
      return
    }

    if (signIn.status === "needs_second_factor") {
      setFormError(
        "Your account requires an extra sign-in step. Complete 2FA in the Clerk account portal or contact support.",
      )
      return
    }

    setFormError("Password reset could not be completed. Try again.")
    console.error("Sign-in not complete after reset:", signIn.status)
  }

  return (
    <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Reset password</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We&apos;ll email you a code. Then choose a new password.
            </p>
          </div>
        </div>

        {!codeSent ? (
          <form onSubmit={(ev) => void sendCode(ev)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forgot-email" className="sr-only">
                Email
              </label>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                value={emailAddress}
                onChange={(ev) => setEmailAddress(ev.target.value)}
                required
                placeholder="Email"
                className={authFieldClass}
              />
              {emailError ? (
                <p className="text-sm text-destructive">{emailError}</p>
              ) : null}
            </div>
            <Button
              type="submit"
              variant="cta"
              disabled={fetchStatus === "fetching"}
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              Send reset code
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full rounded-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => void handleBack()}
            >
              Back to sign in
            </Button>
          </form>
        ) : null}

        {codeSent && signIn?.status !== "needs_new_password" ? (
          <form onSubmit={(ev) => void verifyCode(ev)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forgot-code" className="sr-only">
                Reset code
              </label>
              <Input
                id="forgot-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(ev) => setCode(ev.target.value)}
                required
                placeholder="Enter code from email"
                className={authFieldClass}
              />
              {codeError ? (
                <p className="text-sm text-destructive">{codeError}</p>
              ) : null}
            </div>
            <Button
              type="submit"
              variant="cta"
              disabled={fetchStatus === "fetching"}
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              Verify code
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full rounded-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => void handleBack()}
            >
              Back to sign in
            </Button>
          </form>
        ) : null}

        {signIn?.status === "needs_new_password" ? (
          <form onSubmit={(ev) => void submitNewPassword(ev)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="forgot-password-new" className="sr-only">
                New password
              </label>
              <Input
                id="forgot-password-new"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                placeholder="New password"
                className={authFieldClass}
              />
              {passwordError ? (
                <p className="text-sm text-destructive">{passwordError}</p>
              ) : null}
            </div>
            <Button
              type="submit"
              variant="cta"
              disabled={fetchStatus === "fetching"}
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              Set new password
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full rounded-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => void handleBack()}
            >
              Back to sign in
            </Button>
          </form>
        ) : null}

        {signIn?.status === "needs_second_factor" ? (
          <p className="text-sm text-muted-foreground">
            Additional verification is required for this account. Use another sign-in method or
            contact support.
          </p>
        ) : null}
    </div>
  )
}
