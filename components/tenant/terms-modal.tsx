"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { Button } from "@/components/ui/button"
import { TermsOfServiceContent } from "@/components/shared/terms-of-service-content"

export function TermsModal() {
  const { convexUser, isLoading } = useCurrentUser()
  const acceptTerms = useMutation(api.users.mutations.acceptTerms)
  const [isOpen, setIsOpen] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isLoading && convexUser && !convexUser.acceptedTerms) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [convexUser, isLoading])

  if (!mounted || !isOpen) return null

  const handleAccept = async () => {
    if (!isAccepted) return
    setIsSaving(true)
    try {
      await acceptTerms()
      setIsOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[min(92svh,calc(100svh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-2xl md:max-h-[90vh] md:max-w-3xl md:rounded-[2rem] md:p-8">
        <h2 className="mb-2 shrink-0 font-heading text-xl font-semibold text-foreground md:text-3xl">
          Terms &amp; Conditions
        </h2>
        <p className="mb-4 shrink-0 text-xs text-muted-foreground md:mb-6 md:text-sm">
          Please review and accept our terms to continue using TenantShield.
        </p>

        <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-white p-4 shadow-inner md:p-6">
          <TermsOfServiceContent variant="modal" />
        </div>

        <div className="mt-5 flex shrink-0 items-center gap-3 md:mt-6">
          <input
            type="checkbox"
            id="accept-terms"
            checked={isAccepted}
            onChange={(e) => setIsAccepted(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-gray-300 text-primary accent-primary focus:ring-primary md:h-5 md:w-5"
          />
          <label
            htmlFor="accept-terms"
            className="cursor-pointer select-none text-xs leading-tight text-foreground md:text-sm"
          >
            I accept the Terms and Conditions and Privacy Policy.
          </label>
        </div>

        <div className="mt-5 flex shrink-0 justify-end md:mt-8">
          <Button
            onClick={handleAccept}
            disabled={!isAccepted || isSaving}
            className="w-full rounded-xl border border-foreground bg-foreground px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-foreground/90 disabled:opacity-50 sm:w-auto md:rounded-2xl md:px-8 md:py-6 md:text-lg"
          >
            {isSaving ? "Saving..." : "I Accept"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

