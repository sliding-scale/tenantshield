"use client"

import { useSignIn } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { AuthEnter } from "@/components/auth/auth-enter"
import { AuthPasswordInput } from "@/components/auth/auth-password-input"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { firstClerkErrorCode, firstClerkErrorMessage } from "@/lib/auth/clerk-errors"
import {
  signInMfaSchema,
  signInSchema,
  type SignInMfaValues,
  type SignInValues,
} from "@/lib/auth/auth-schemas"
import { authButtonClass, authFieldClass } from "@/lib/ui/auth-field-styles"

type Props = {
  /** When omitted, self-serve signup links are hidden (e.g. admin login). */
  signUpHref?: string
  forgotOpen: boolean
  setForgotOpen: (open: boolean) => void
  /** Post-sign-in path for `finalize` navigation. */
  redirectTo?: string
  /** When false, forgot-password UI is hidden (e.g. admin email/password only). */
  allowForgotPassword?: boolean
  /** Stagger index offset for AuthEnter wrappers (page header/title use 0–1). */
  animationBaseIndex?: number
}

export function SignInForm({
  signUpHref,
  forgotOpen,
  setForgotOpen,
  redirectTo = "/dashboard",
  allowForgotPassword = true,
  animationBaseIndex = 0,
}: Props) {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [needsClientTrustCode, setNeedsClientTrustCode] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showNoAccountHint, setShowNoAccountHint] = useState(false)

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  })

  const mfaForm = useForm<SignInMfaValues>({
    resolver: zodResolver(signInMfaSchema),
    defaultValues: {
      code: "",
    },
  })

  const resetFlow = async () => {
    await signIn?.reset()
    setNeedsClientTrustCode(false)
    mfaForm.reset()
    setFormError(null)
    setShowNoAccountHint(false)
  }

  const finalizeSignIn = async () => {
    if (!signIn) return
    const { error } = await signIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) return
        const url = decorateUrl(redirectTo)
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

  const onSubmit = async (values: SignInValues) => {
    setFormError(null)
    setShowNoAccountHint(false)

    if (!signIn) return

    const { error: signInError } = await signIn.password({
      emailAddress: values.emailAddress.trim(),
      password: values.password,
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

  const onVerifyMfa = async (values: SignInMfaValues) => {
    setFormError(null)
    if (!signIn) return

    const { error } = await signIn.mfa.verifyEmailCode({ code: values.code })
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

  if (allowForgotPassword && forgotOpen) {
    return (
      <ForgotPasswordForm
        initialEmail={form.getValues("emailAddress")}
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
        <Form {...mfaForm}>
          <form onSubmit={mfaForm.handleSubmit(onVerifyMfa)} className="flex flex-col gap-4">
            <FormField
              control={mfaForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Verification code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Verification code"
                      className={authFieldClass}
                    />
                  </FormControl>
                  {errors.fields.code ? (
                    <p className="text-sm text-destructive">{errors.fields.code.message}</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
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
        </Form>
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AuthEnter index={animationBaseIndex}>
          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    className={authFieldClass}
                  />
                </FormControl>
                {errors.fields.identifier ? (
                  <p className="text-sm text-destructive">{errors.fields.identifier.message}</p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        </AuthEnter>
        <AuthEnter index={animationBaseIndex + 1}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Password</FormLabel>
                <AuthPasswordInput
                  {...field}
                  autoComplete="current-password"
                  placeholder="Password"
                  className={authFieldClass}
                />
                {errors.fields.password ? (
                  <p className="text-sm text-destructive">{errors.fields.password.message}</p>
                ) : null}
                <FormMessage />
                {signUpHref || allowForgotPassword ? (
                  <div
                    className={
                      signUpHref && allowForgotPassword
                        ? "flex flex-row items-center justify-between gap-3 pt-0.5"
                        : "flex flex-row items-center justify-end gap-3 pt-0.5"
                    }
                  >
                    {allowForgotPassword ? (
                      <button
                        type="button"
                        onClick={() => void openForgot()}
                        className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
                      >
                        Forgot password?
                      </button>
                    ) : null}
                    {signUpHref ? (
                      <Link
                        href={signUpHref}
                        className="shrink-0 text-sm font-semibold text-foreground underline underline-offset-4 hover:text-foreground/80"
                      >
                        Create account
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </FormItem>
            )}
          />
        </AuthEnter>
        {showNoAccountHint ? (
          <AuthEnter index={animationBaseIndex + 2}>
            <p className="text-sm text-muted-foreground">
              {signUpHref ? (
                <>
                  No account found for this email.{" "}
                  <Link href={signUpHref} className="font-semibold text-foreground underline underline-offset-4">
                    Sign up
                  </Link>{" "}
                  to create one.
                </>
              ) : (
                <>No admin account found for this email. If you need access, contact your organization.</>
              )}
            </p>
          </AuthEnter>
        ) : null}
        {formError ? (
          <AuthEnter index={animationBaseIndex + 2}>
            <p className="text-sm text-destructive">{formError}</p>
          </AuthEnter>
        ) : null}
        <AuthEnter index={animationBaseIndex + 3}>
          <Button
            type="submit"
            variant="cta"
            disabled={fetchStatus === "fetching" || form.formState.isSubmitting}
            className={`${authButtonClass} mt-1 text-base font-semibold`}
          >
            Sign in
          </Button>
        </AuthEnter>
      </form>
    </Form>
  )
}
