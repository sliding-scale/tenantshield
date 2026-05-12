"use client"

import Link from "next/link"
import { Gift, Zap, ShieldCheck, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FreeTrialPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-cream-page px-5 pb-10 pt-8 dark:bg-background md:flex md:items-center md:justify-center md:px-8">
      <div className="mx-auto w-full max-w-lg md:max-w-xl">
        {/* Top Graphic */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 mt-2 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-[#111111] dark:bg-neutral-800 md:h-28 md:w-28 md:rounded-[3rem]">
            <Gift className="h-12 w-12 text-amber-500 md:h-14 md:w-14" strokeWidth={1.5} />
          </div>

          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">
            A gift on us
          </p>

          <h1 className="font-heading text-[2.75rem] font-semibold leading-none tracking-tight text-foreground md:text-6xl">
            Start with 3 days
            <br />
            completely free.
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:px-4 md:text-xl">
            Get the full power of TenantShield — unlimited AI chat, unlimited demand letters, lease analyses, and every state&apos;s law at your fingertips. No charge for 3 days.
          </p>
        </div>

        {/* Feature List */}
        <div className="mt-10 flex flex-col gap-3">
          <div className="flex items-center gap-4 rounded-2xl border border-cream-border bg-white p-4 shadow-sm dark:border-border dark:bg-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Zap className="h-5 w-5 text-ink-warm dark:text-foreground" strokeWidth={2} />
            </div>
            <p className="text-[1.05rem] leading-snug text-ink-warm dark:text-foreground">
              Unlocks the moment you pay — nothing held back
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-cream-border bg-white p-4 shadow-sm dark:border-border dark:bg-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <ShieldCheck className="h-5 w-5 text-ink-warm dark:text-foreground" strokeWidth={2} />
            </div>
            <p className="text-[1.05rem] leading-snug text-ink-warm dark:text-foreground">
              Cancel anytime before your trial ends
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-cream-border bg-white p-4 shadow-sm dark:border-border dark:bg-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Bell className="h-5 w-5 text-ink-warm dark:text-foreground" strokeWidth={2} />
            </div>
            <p className="text-[1.05rem] leading-snug text-ink-warm dark:text-foreground">
              We&apos;ll remind you before billing starts
            </p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-8 rounded-2xl bg-[#111111] p-6 text-white dark:bg-neutral-900 md:p-8">
          <p className="text-[1.05rem] italic leading-relaxed text-white/90 md:text-lg">
            &quot;I got my $2,800 deposit back in 11 days using one of their letters. This app paid for itself hundreds of times over.&quot;
          </p>
          <p className="mt-4 text-sm font-semibold text-amber-500">
            — Maya R., Oakland CA
          </p>
        </div>

        {/* Continue Button */}
        <div className="mt-8 pb-4">
          <Button
            asChild
            className="h-14 w-full rounded-2xl bg-[#111111] px-6 text-lg font-semibold text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Link href="/onboarding/no-surprise">Continue</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
