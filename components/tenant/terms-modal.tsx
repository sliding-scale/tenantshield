"use client"
import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { Button } from "@/components/ui/button"

export function TermsModal() {
  const { convexUser, isLoading } = useCurrentUser()
  const acceptTerms = useMutation(api.users.mutations.acceptTerms)
  const [isOpen, setIsOpen] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Avoid Hydration Mismatch
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex w-full max-w-lg md:max-w-2xl max-h-[75vh] flex-col overflow-hidden rounded-3xl md:rounded-[2rem] border border-cream-border bg-cream-surface p-5 md:p-8 shadow-2xl">
        <h2 className="mb-2 shrink-0 font-heading text-xl md:text-3xl font-semibold text-ink-warm">Terms &amp; Conditions</h2>
        <p className="mb-4 shrink-0 text-xs md:text-sm text-muted-foreground md:mb-6">
          Please review and accept our terms to continue using TenantShield.
        </p>

        <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-white p-4 md:p-6 text-xs md:text-sm leading-relaxed text-ink-warm-muted shadow-inner">
          <p className="mb-4">
            <strong>1. General Acceptance</strong>
            <br />
            By accessing or using TenantShield, you agree to be bound by these Terms and Conditions. This is a general placeholder text for the agreement and will be updated with full legal definitions shortly.
          </p>
          <p className="mb-4">
            <strong>2. User Responsibilities</strong>
            <br />
            You agree to provide accurate information and use our platform in compliance with all applicable local, state, and federal laws. You are responsible for maintaining the confidentiality of your account credentials.
          </p>
          <p className="mb-4">
            <strong>3. Data Privacy and Security</strong>
            <br />
            We prioritize your data privacy. By using our services, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.
          </p>
          <p className="mb-4">
            <strong>4. Legal Disclaimer</strong>
            <br />
            TenantShield provides AI-driven insights and template generation. Our service does not constitute formal legal counsel. For critical disputes, we strongly recommend consulting a licensed attorney.
          </p>
          <p>
            <strong>5. Modifications to Terms</strong>
            <br />
            We reserve the right to modify these terms at any time. Continued use of the platform after changes implies your acceptance of the updated terms.
          </p>
        </div>
        
        <div className="mt-5 md:mt-6 flex shrink-0 items-center gap-3">
          <input 
            type="checkbox"
            id="accept-terms" 
            checked={isAccepted} 
            onChange={(e) => setIsAccepted(e.target.checked)}
            className="h-4 w-4 md:h-5 md:w-5 shrink-0 rounded border-gray-300 text-primary accent-primary focus:ring-primary"
          />
          <label htmlFor="accept-terms" className="cursor-pointer select-none text-xs md:text-sm leading-tight text-ink-warm">
            I accept the Terms and Conditions and Privacy Policy.
          </label>
        </div>

        <div className="mt-5 md:mt-8 flex shrink-0 justify-end">
          <Button 
            onClick={handleAccept} 
            disabled={!isAccepted || isSaving}
            className="w-full rounded-xl md:rounded-2xl border border-surface-strong bg-surface-strong px-5 py-4 md:px-8 md:py-6 text-sm md:text-lg font-semibold text-white transition-colors hover:bg-surface-strong-hover disabled:opacity-50 sm:w-auto"
          >
            {isSaving ? "Saving..." : "I Accept"}
          </Button>
        </div>
      </div>
    </div>
  )
}
