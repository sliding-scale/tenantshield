"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NoSurprisePage() {
  return (
    <main className="min-h-[100dvh] w-full bg-cream-page px-5 pb-8 pt-10 dark:bg-background md:flex md:items-center md:justify-center md:px-8">
      <div className="mx-auto w-full max-w-lg md:max-w-xl">
        
        {/* Top Graphic */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-[#111111] dark:bg-neutral-800 md:h-28 md:w-28 md:rounded-[3rem]">
            <Bell className="h-12 w-12 text-amber-500 fill-amber-500 md:h-14 md:w-14" strokeWidth={1.5} />
          </div>

          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">
            Transparent. Always.
          </p>

          <h1 className="font-heading text-5xl font-semibold leading-tight text-foreground md:text-6xl">
            No surprise<br />charges.
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:px-4 md:text-xl">
            We&apos;ll send you a reminder <strong className="font-semibold text-foreground">24 hours before </strong> your free trial ends, so you can decide with no pressure. Cancel with two taps. Continue if it&apos;s already saved you hours.
          </p>
        </div>

        {/* Timeline */}
        <div className="mt-10 pl-3">
          <div className="relative border-l-2 border-neutral-200 pb-8 pl-6 dark:border-neutral-800">
            <span className="absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 ring-4 ring-cream-page dark:ring-background" />
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">TODAY</p>
            <p className="mt-1 font-heading text-xl font-semibold text-foreground">Trial starts</p>
            <p className="mt-1 text-[0.95rem] text-muted-foreground">Full access to everything — unlimited.</p>
          </div>

          <div className="relative border-l-2 border-neutral-200 pb-8 pl-6 dark:border-neutral-800">
            <span className="absolute -left-[9px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300 ring-4 ring-cream-page dark:bg-neutral-600 dark:ring-background" />
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">DAY 2</p>
            <p className="mt-1 font-heading text-xl font-semibold text-foreground">Reminder sent</p>
            <p className="mt-1 text-[0.95rem] text-muted-foreground">Email + push — cancel anytime from Settings.</p>
          </div>

          <div className="relative pl-6">
            <span className="absolute -left-[9px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300 ring-4 ring-cream-page dark:bg-neutral-600 dark:ring-background" />
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">DAY 3</p>
            <p className="mt-1 font-heading text-xl font-semibold text-foreground">Billing begins</p>
            <p className="mt-1 text-[0.95rem] text-muted-foreground">Only if you love it. Otherwise cancel free.</p>
          </div>
        </div>

        {/* See My Subscription Button */}
        <div className="mt-12 pb-6 text-center">
          <Button
            asChild
            className="h-14 w-full rounded-2xl bg-[#111111] px-6 text-lg font-semibold text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Link href="/onboarding/plans">See My Subscription</Link>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Cancel in 2 taps · No auto-charge surprises
          </p>
        </div>

      </div>
    </main>
  )
}
