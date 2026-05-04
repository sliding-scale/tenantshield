"use client"

import { useSignUp } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginContinuePage() {
  const router = useRouter()
  const { signUp } = useSignUp()

  const handleSubmit = async (formData: FormData) => {
    if (!signUp) return
    const fullName = (formData.get("fullName") as string) ?? ""
    const { error } = await signUp.update({ unsafeMetadata: { fullName } })
    if (error) {
      console.error(error)
      return
    }
    if (signUp.status === "complete") {
      const { error } = await signUp.finalize({
        navigate: async ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            return
          }
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
    } else if (signUp.status !== "missing_requirements") {
      console.error("Sign-up attempt not complete:", signUp.status)
    }
  }

  if (!signUp) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (signUp.status === "complete") {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to sign up
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl tracking-tight">Continue sign-up</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a few more details to finish creating your account.
        </p>
        <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="text-sm font-medium">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              className="h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              className="h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="mt-2 h-11 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Submit
          </button>
        </form>
      </div>
      <div id="clerk-captcha" />
    </div>
  )
}
