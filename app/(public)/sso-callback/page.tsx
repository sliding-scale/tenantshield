"use client"

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export default function SsoCallbackPage() {
  const clerk = useClerk()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const router = useRouter()
  const hasRun = useRef(false)

  const navigateToLogin = () => {
    router.push("/login")
  }

  const finalizeSignIn = async () => {
    if (!signIn) return
    const { error } = await signIn.finalize({
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
  }

  const finalizeSignUp = async () => {
    if (!signUp) return
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
  }

  useEffect(() => {
    void (async () => {
      if (!clerk.loaded || hasRun.current) {
        return
      }
      if (!signIn || !signUp) {
        return
      }

      hasRun.current = true

      if (signIn.status === "complete") {
        await finalizeSignIn()
        return
      }

      if (signUp.isTransferable) {
        const { error } = await signIn.create({ transfer: true })
        if (error) {
          console.error(error)
          navigateToLogin()
          return
        }
        const signInStatus = signIn.status as string
        if (signInStatus === "complete") {
          await finalizeSignIn()
          return
        }
        return navigateToLogin()
      }

      if (
        signIn.status === "needs_first_factor" &&
        !signIn.supportedFirstFactors?.every((f) => f.strategy === "enterprise_sso")
      ) {
        return navigateToLogin()
      }

      if (signIn.isTransferable) {
        const { error } = await signUp.create({ transfer: true })
        if (error) {
          console.error(error)
          navigateToLogin()
          return
        }
        if (signUp.status === "complete") {
          await finalizeSignUp()
          return
        }
        router.push("/login/continue")
        return
      }

      if (signUp.status === "complete") {
        await finalizeSignUp()
        return
      }

      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_new_password"
      ) {
        return navigateToLogin()
      }

      if (signIn.existingSession || signUp.existingSession) {
        const sessionId =
          signIn.existingSession?.sessionId || signUp.existingSession?.sessionId
        if (sessionId) {
          await clerk.setActive({
            session: sessionId,
            navigate: async ({ session: sess, decorateUrl }) => {
              if (sess?.currentTask) {
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
          return
        }
      }

      navigateToLogin()
    })()
  }, [clerk, clerk.loaded, signIn, signUp, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
      <div id="clerk-captcha" />
    </div>
  )
}
