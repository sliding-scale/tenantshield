"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import bgImage from "../../../../(public)/images/test.jpg"

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly" | "per-letter">("yearly")

  return (
    <main className="min-h-[100dvh] w-full bg-cream-page dark:bg-background">
      {/* Top Header */}
      <div 
        className="relative flex min-h-[38vh] flex-col justify-end bg-cover bg-center px-6 pb-10 pt-16 md:px-10 lg:min-h-[40vh]"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.85)), url('${bgImage.src}')` }}
      >
        <div className="mx-auto w-full max-w-lg md:max-w-xl lg:max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">
            Unlock TenantShield
          </p>
          <h1 className="font-heading text-[3.5rem] font-semibold leading-[1.05] text-white lg:text-7xl">
            Pick your<br />protection.
          </h1>
          <p className="mt-4 max-w-sm text-lg leading-snug text-white/90 lg:max-w-md lg:text-xl">
            Full access unlocks the moment you subscribe. Cancel anytime.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg px-5 py-8 md:max-w-xl lg:max-w-2xl lg:py-10">
        <div className="flex flex-col gap-4">
          
          {/* Yearly Plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan("yearly")}
            className={`relative flex w-full flex-col rounded-[2rem] border text-left transition-all ${
              selectedPlan === "yearly"
                ? "border-black bg-[#111111] text-white shadow-lg"
                : "border-cream-border bg-white text-ink-warm hover:border-black/30"
            }`}
          >
            <div className="flex w-full items-start justify-between px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedPlan === "yearly" ? "border-amber-500" : "border-neutral-300"}`}>
                  {selectedPlan === "yearly" && <div className="h-3 w-3 rounded-full bg-amber-500" />}
                </div>
                <span className={`text-xs font-bold uppercase tracking-[0.15em] ${selectedPlan === "yearly" ? "text-amber-500" : "text-muted-foreground"}`}>
                  Yearly — 3-Day<br className="hidden lg:block" /> Free Trial
                </span>
              </div>
              <div className="rounded bg-amber-500 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-black">
                Best Value - Save 25%
              </div>
            </div>

            <div className="flex flex-col items-center px-6 pb-8 pt-8">
              <div className="flex items-baseline gap-1">
                {/* Showing $89.99 as inferred price for yearly, otherwise design only shows /year */}
                <span className={`font-heading text-5xl font-semibold tracking-tight ${selectedPlan === "yearly" ? "text-white" : "text-foreground"}`}>
                  $89.99
                </span>
                <span className={`text-xl ${selectedPlan === "yearly" ? "text-white/60" : "text-muted-foreground"}`}>
                  /year
                </span>
              </div>
              <p className={`mt-3 text-sm ${selectedPlan === "yearly" ? "text-white/60" : "text-muted-foreground"}`}>
                3 days free, then $89.99/year · Less than $7.50/mo
              </p>

              <div className="mt-8 flex w-full flex-col gap-3">
                {[
                  "3-day free trial — cancel anytime",
                  "Unlimited AI chat, letters, lease analyses",
                  "Priority Claude Sonnet 4.5 responses",
                  "All 50 states + DC tenant rights",
                  "We'll remind you before billing",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <span className={`text-[0.95rem] ${selectedPlan === "yearly" ? "text-white/90" : "text-ink-warm"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </button>

          {/* Monthly Plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`relative flex w-full flex-col rounded-[2rem] border p-6 text-left transition-all ${
              selectedPlan === "monthly"
                ? "border-black bg-[#111111] text-white shadow-lg"
                : "border-cream-border bg-white text-ink-warm shadow-sm hover:border-black/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedPlan === "monthly" ? "border-amber-500" : "border-neutral-300"}`}>
                {selectedPlan === "monthly" && <div className="h-3 w-3 rounded-full bg-amber-500" />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${selectedPlan === "monthly" ? "text-amber-500" : "text-muted-foreground"}`}>
                Monthly
              </span>
            </div>
            
            <div className="mt-4 flex items-baseline gap-1 pl-9">
              <span className={`font-heading text-5xl font-semibold tracking-tight ${selectedPlan === "monthly" ? "text-white" : "text-foreground"}`}>
                $9.99
              </span>
              <span className={`text-lg ${selectedPlan === "monthly" ? "text-white/60" : "text-muted-foreground"}`}>
                /month
              </span>
            </div>
            <p className={`mt-2 pl-9 text-sm ${selectedPlan === "monthly" ? "text-white/60" : "text-muted-foreground"}`}>
              Full Pro access · Cancel anytime
            </p>
          </button>

          {/* Pay-Per-Letter */}
          <button
            type="button"
            onClick={() => setSelectedPlan("per-letter")}
            className={`relative flex w-full flex-col rounded-[2rem] border p-6 text-left transition-all ${
              selectedPlan === "per-letter"
                ? "border-black bg-[#111111] text-white shadow-lg"
                : "border-cream-border bg-white text-ink-warm shadow-sm hover:border-black/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedPlan === "per-letter" ? "border-amber-500" : "border-neutral-300"}`}>
                {selectedPlan === "per-letter" && <div className="h-3 w-3 rounded-full bg-amber-500" />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${selectedPlan === "per-letter" ? "text-amber-500" : "text-muted-foreground"}`}>
                Pay-Per-Letter
              </span>
            </div>
            
            <div className="mt-4 flex items-baseline gap-1 pl-9">
              <span className={`font-heading text-5xl font-semibold tracking-tight ${selectedPlan === "per-letter" ? "text-white" : "text-foreground"}`}>
                $29.99
              </span>
              <span className={`text-lg ${selectedPlan === "per-letter" ? "text-white/60" : "text-muted-foreground"}`}>
                /letter
              </span>
            </div>
            <p className={`mt-2 pl-9 text-sm ${selectedPlan === "per-letter" ? "text-white/60" : "text-muted-foreground"}`}>
              One urgent letter · No subscription
            </p>
          </button>

        </div>

        {/* Footer Actions */}
        <div className="mt-8 text-center pb-8">
          <Button
            asChild
            className="h-[4.25rem] w-full rounded-[1.25rem] bg-[#F59E0B] px-6 text-xl font-bold text-black transition-colors hover:bg-[#D97706]"
          >
            <Link href="/dashboard">
              {selectedPlan === "yearly" ? "Start 3-Day Free Trial" : "Continue"}
            </Link>
          </Button>

          <p className="mt-5 text-[0.8rem] text-muted-foreground">
            Secured by Stripe · 7-day money-back guarantee
          </p>

          <div className="mt-5">
            <Link 
              href="/dashboard" 
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Not now — sign out
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
