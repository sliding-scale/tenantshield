"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { ChevronLeft, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChangePasswordPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not loaded or if user is Google auth
  if (isLoaded && user) {
    const isGoogleAuth = user.externalAccounts.some(acc => (acc.provider as string) === "oauth_google" || (acc.provider as string) === "google")
    if (isGoogleAuth) {
      router.push("/profile")
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setIsSubmitting(true)
    try {
      await user?.updatePassword({
        currentPassword,
        newPassword,
      })
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      console.error("Error updating password:", err)
      setError(err.errors?.[0]?.message || err.message || "Failed to update password. Please check your current password.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-6 sm:px-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10 md:pt-8 lg:px-10 lg:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 flex items-center gap-4 md:mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/profile")}
            className="h-11 w-11 shrink-0 rounded-full border-border bg-cream-surface-soft p-0 text-foreground"
            aria-label="Back to profile"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">Change Password</h1>
          </div>
        </header>

        <div className="rounded-[2rem] border border-cream-border bg-cream-surface p-5 shadow-sm sm:p-7 md:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </div>
            <p className="text-sm font-medium text-ink-warm-muted md:text-base">
              Update your account password below.
            </p>
          </div>

          {success ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
              <p className="font-medium text-green-800">Password updated successfully!</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-xl border-green-200 bg-white text-green-800 hover:bg-green-50"
                onClick={() => router.push("/profile")}
              >
                Back to Profile
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="current-password" className="text-sm font-medium text-ink-warm">
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-password" className="text-sm font-medium text-ink-warm">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="text-sm font-medium text-ink-warm">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

              <Button
                type="submit"
                disabled={isSubmitting || !isLoaded}
                className="mt-4 h-12 w-full rounded-xl bg-surface-strong text-base font-semibold text-white hover:bg-surface-strong-hover"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
