"use client"

import { useSignUp } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { AuthEnter } from "@/components/auth/auth-enter"
import { AuthPasswordInput } from "@/components/auth/auth-password-input"
import { AuthStateSelect } from "@/components/auth/auth-state-select"
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
import { firstClerkErrorMessage } from "@/lib/auth/clerk-errors"
import {
  emailVerificationSchema,
  signUpSchema,
  type EmailVerificationValues,
  type SignUpValues,
} from "@/lib/auth/auth-schemas"
import { splitFullName } from "@/lib/auth/signup-metadata"
import { authButtonClass, authFieldClass } from "@/lib/ui/auth-field-styles"

type Props = {
  unsafeMetadata?: Record<string, unknown>
  animationBaseIndex?: number
}

export function SignUpForm({ unsafeMetadata, animationBaseIndex = 0 }: Props) {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()

  const [awaitingEmailCode, setAwaitingEmailCode] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      emailAddress: "",
      password: "",
      state: "",
    },
  })

  const verifyForm = useForm<EmailVerificationValues>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      code: "",
    },
  })

  const resetFlow = async () => {
    await signUp?.reset()
    setAwaitingEmailCode(false)
    setPendingEmail("")
    verifyForm.reset()
    form.reset()
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

  const onCredentialsSubmit = async (values: SignUpValues) => {
    setFormError(null)

    if (!signUp) return

    const { firstName, lastName } = splitFullName(values.fullName)
    const state = values.state.trim()

    const { error: signUpError } = await signUp.password({
      emailAddress: values.emailAddress.trim(),
      password: values.password,
      firstName,
      lastName,
      unsafeMetadata: { ...unsafeMetadata, state },
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

    setPendingEmail(values.emailAddress.trim())

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

  const onVerifySubmit = async (values: EmailVerificationValues) => {
    setFormError(null)
    if (!signUp) return

    const { error } = await signUp.verifications.verifyEmailCode({ code: values.code })
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
            We sent a code to {pendingEmail}. Enter it below to finish creating your account.
          </p>
        </div>
        <Form {...verifyForm}>
          <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="flex flex-col gap-4">
            <FormField
              control={verifyForm.control}
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
              disabled={fetchStatus === "fetching" || verifyForm.formState.isSubmitting}
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onCredentialsSubmit)} className="flex flex-col gap-4">
        <AuthEnter index={animationBaseIndex}>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Full name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    className={authFieldClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AuthEnter>
        <AuthEnter index={animationBaseIndex + 1}>
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
                {errors.fields.emailAddress ? (
                  <p className="text-sm text-destructive">{errors.fields.emailAddress.message}</p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        </AuthEnter>
        <AuthEnter index={animationBaseIndex + 2}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Password</FormLabel>
                <AuthPasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="Password (6+ characters)"
                  className={authFieldClass}
                />
                {errors.fields.password ? (
                  <p className="text-sm text-destructive">{errors.fields.password.message}</p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        </AuthEnter>
        <AuthEnter index={animationBaseIndex + 3}>
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <AuthStateSelect
                  id="signup-state"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  placeholder="Select your state"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </AuthEnter>
        {formError ? (
          <AuthEnter index={animationBaseIndex + 4}>
            <p className="text-sm text-destructive">{formError}</p>
          </AuthEnter>
        ) : null}
        <AuthEnter index={animationBaseIndex + (formError ? 5 : 4)}>
          <Button
            type="submit"
            variant="cta"
            disabled={fetchStatus === "fetching" || form.formState.isSubmitting}
            className={`${authButtonClass} mt-1 text-base font-semibold`}
          >
            Create My Shield
          </Button>
        </AuthEnter>
        <div id="clerk-captcha" />
      </form>
    </Form>
  )
}
