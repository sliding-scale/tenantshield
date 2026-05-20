"use client"

import { useSignUp } from "@clerk/nextjs"
import Link from "next/link"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { US_STATES, US_STATE_NAMES } from "@/lib/constants/us-states"

export default function LoginContinuePage() {
  const router = useRouter()
  const { signUp } = useSignUp()
  const [state, setState] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!signUp) return
    setError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = (formData.get("fullName") as string) ?? ""

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
  }

  if (!signUp) {
    return <ShieldLoader variant="auth" fullPage />
  }

  if (signUp.status === "complete") {
    router.push("/dashboard")
    return null
  }

  const inputClass = "h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to sign up
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl tracking-tight">Almost there!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A couple more details to finish setting up your account.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="continue-state" className="text-sm font-medium">
              Your state <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <select
              id="continue-state"
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select your state…</option>
              {US_STATES.map((abbr) => (
                <option key={abbr} value={abbr}>
                  {US_STATE_NAMES[abbr]} ({abbr})
                </option>
              ))}
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            className="mt-2 h-11 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Continue
          </button>
        </form>
      </div>
      <div id="clerk-captcha" />
    </div>
  )
}
