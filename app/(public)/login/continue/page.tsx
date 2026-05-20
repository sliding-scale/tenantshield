"use client"

import { useSignUp } from "@clerk/nextjs"
import { ChevronLeft, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthEnter } from "@/components/auth/auth-enter"
import { AuthStateSelect } from "@/components/auth/auth-state-select"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authButtonClass, authFieldClass } from "@/lib/ui/auth-field-styles"
import { cn } from "@/lib/utils"

export default function LoginContinuePage() {
  const router = useRouter()
  const { signUp } = useSignUp()
  const [state, setState] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!signUp || isSubmitting) return
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const fullName = (formData.get("fullName") as string) ?? ""

    try {
      const { error: updateError } = await signUp.update({
        unsafeMetadata: { fullName, ...(state ? { state } : {}) },
      })
      if (updateError) {
        console.error(updateError)
        setError("Could not save your details. Please try again.")
        return
      }
      if (signUp.status === "complete") {
        const { error: finalizeError } = await signUp.finalize({
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
        if (finalizeError) {
          console.error(finalizeError)
        }
      } else if (signUp.status !== "missing_requirements") {
        console.error("Sign-up attempt not complete:", signUp.status)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!signUp) {
    return <ShieldLoader variant="auth" fullPage />
  }

  if (signUp.status === "complete") {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <AuthEnter index={0}>
            <header className="mb-8 flex shrink-0 items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-full border-border bg-popover shadow-sm"
                asChild
              >
                <Link href="/signup" aria-label="Back to sign up">
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
          </AuthEnter>

          <main className="flex w-full flex-col">
            <AuthEnter index={1}>
              <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-[2.5rem]">
                Almost there!
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                A couple more details to finish setting up your account.
              </p>
            </AuthEnter>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <AuthEnter index={2}>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    className={authFieldClass}
                  />
                </div>
              </AuthEnter>

              <AuthEnter index={3}>
                <AuthStateSelect
                  id="continue-state"
                  value={state}
                  onValueChange={setState}
                  showLabel
                  optional
                />
              </AuthEnter>

              {error ? (
                <AuthEnter index={4}>
                  <p className="text-sm text-destructive">{error}</p>
                </AuthEnter>
              ) : null}

              <AuthEnter index={error ? 5 : 4}>
                <Button
                  type="submit"
                  variant="cta"
                  disabled={isSubmitting}
                  className={cn(authButtonClass, "text-base font-semibold")}
                >
                  {isSubmitting ? "Saving…" : "Continue"}
                </Button>
              </AuthEnter>
            </form>

            <div id="clerk-captcha" />
          </main>
        </div>
      </div>
    </div>
  )
}
