"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import bgImage from "../../../../(public)/images/test.jpg";

const planCopy = {
  yearly: {
    title: "Yearly",
    kicker: "3-day free trial",
    price: "$89.99",
    suffix: "/year",
    description: "3 days free, then $89.99/year · Less than $7.50/mo",
  },
  monthly: {
    title: "Monthly",
    kicker: "Pay monthly",
    price: "$9.99",
    suffix: "/month",
    description: "Full Pro access · Cancel anytime",
  },
  "per-letter": {
    title: "Pay-Per-Letter",
    kicker: "No subscription",
    price: "$29.99",
    suffix: "/letter",
    description: "One urgent letter · No subscription",
  },
} as const;

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<
    "yearly" | "monthly" | "per-letter"
  >("yearly");
  const selectedPlanDetails = planCopy[selectedPlan];

  return (
    <main className="min-h-[100dvh] w-full bg-background text-foreground">
      <div
        className="relative overflow-hidden border-b border-border bg-cover bg-center px-6 pb-10 pt-16 md:px-10 lg:px-12 lg:pb-12 lg:pt-20"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15,15,15,0.32), rgba(15,15,15,0.9)), url('${bgImage.src}')`,
        }}
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-12">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
              Unlock TenantShield
            </p>
            <h1 className="font-heading text-[3.25rem] font-semibold leading-[1.02] text-white text-balance sm:text-6xl lg:text-7xl">
              Pick your
              <br />
              protection.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-snug text-white/90 lg:text-xl">
              Full access unlocks the moment you subscribe. Cancel anytime.
            </p>
          </div>

          <div className="grid gap-3 max-lg:mx-auto max-lg:w-full max-lg:max-w-md sm:grid-cols-3 sm:justify-items-stretch lg:max-w-none">
            {[
              {
                icon: Sparkles,
                title: "Fast setup",
                description: "Choose a plan and keep moving.",
              },
              {
                icon: ShieldCheck,
                title: "No surprise billing",
                description: "You get reminders before charges hit.",
              },
              {
                icon: TimerReset,
                title: "Trial included",
                description: "Yearly starts with 3 days free.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="w-full rounded-2xl border border-white/10 bg-[#2f2a23] p-4 text-white shadow-sm backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-10">
        <aside className="max-lg:mx-auto max-lg:w-full max-lg:max-w-md lg:sticky lg:top-8 lg:max-w-none">
          <div className="rounded-[2rem] border border-white/10 bg-[#2f2a23] p-6 text-white shadow-sm lg:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Current selection
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-white">
              {selectedPlanDetails.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              {selectedPlanDetails.description}
            </p>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white p-5 text-foreground shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {selectedPlanDetails.kicker}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-5xl font-semibold tracking-tight">
                  {selectedPlanDetails.price}
                </span>
                <span className="text-lg text-muted-foreground">
                  {selectedPlanDetails.suffix}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {selectedPlan === "yearly"
                  ? "3 days free, then $89.99/year · Less than $7.50/mo"
                  : selectedPlanDetails.description}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Unlimited AI chat, letters, lease analyses",
                "Priority Claude Sonnet 4.5 responses",
                "All 50 states + DC tenant rights",
                "We'll remind you before billing",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-white">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-4 max-lg:mx-auto max-lg:w-full max-lg:max-w-md lg:space-y-4 lg:max-w-none">
          <button
            type="button"
            onClick={() => setSelectedPlan("yearly")}
            className={`relative mx-auto flex w-full max-w-md flex-col rounded-[2rem] border text-left transition-all lg:max-w-none ${
              selectedPlan === "yearly"
                ? "border-white/10 bg-[#2f2a23] text-white shadow-lg"
                : "border-white/10 bg-[#2f2a23] text-white hover:bg-[#362f27]"
            }`}
          >
            <div className="flex w-full flex-col gap-3 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedPlan === "yearly" ? "border-primary" : "border-border"}`}
                >
                  {selectedPlan === "yearly" && (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-[0.15em] ${selectedPlan === "yearly" ? "text-primary" : "text-white/60"}`}
                >
                  Yearly — 3-Day Free Trial
                </span>
              </div>
              <div className="self-start rounded bg-primary px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary-foreground sm:self-auto">
                Best Value - Save 25%
              </div>
            </div>

            <div className="flex flex-col items-center px-6 pb-8 pt-7 sm:pt-8">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-5xl font-semibold tracking-tight text-white">
                  $89.99
                </span>
                <span className="text-xl text-white/65">/year</span>
              </div>
              <p className="mt-3 text-sm text-white/70">
                3 days free, then $89.99/year · Less than $7.50/mo
              </p>

              <div className="mt-8 grid w-full gap-3">
                {[
                  "3-day free trial — cancel anytime",
                  "Unlimited AI chat, letters, lease analyses",
                  "Priority Claude Sonnet 4.5 responses",
                  "All 50 states + DC tenant rights",
                  "We'll remind you before billing",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-[0.95rem] text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>

          <div className="grid gap-4 max-lg:mx-auto max-lg:w-full max-lg:max-w-md lg:grid-cols-2 lg:max-w-none">
            <button
              type="button"
              onClick={() => setSelectedPlan("monthly")}
              className={`relative mx-auto flex w-full max-w-md flex-col rounded-[2rem] border p-6 text-left transition-all lg:max-w-none ${
                selectedPlan === "monthly"
                  ? "border-white/10 bg-[#2f2a23] text-white shadow-lg"
                  : "border-white/10 bg-[#2f2a23] text-white shadow-sm hover:bg-[#362f27]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedPlan === "monthly" ? "border-primary" : "border-border"}`}
                >
                  {selectedPlan === "monthly" && (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${selectedPlan === "monthly" ? "text-primary" : "text-white/60"}`}
                >
                  Monthly
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1 pl-9">
                <span className="font-heading text-5xl font-semibold tracking-tight text-white">
                  $9.99
                </span>
                <span className="text-lg text-white/65">/month</span>
              </div>
              <p className="mt-2 pl-9 text-sm text-white/70">
                Full Pro access · Cancel anytime
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan("per-letter")}
              className={`relative mx-auto flex w-full max-w-md flex-col rounded-[2rem] border p-6 text-left transition-all lg:max-w-none ${
                selectedPlan === "per-letter"
                  ? "border-white/10 bg-[#2f2a23] text-white shadow-lg"
                  : "border-white/10 bg-[#2f2a23] text-white shadow-sm hover:bg-[#362f27]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedPlan === "per-letter" ? "border-primary" : "border-border"}`}
                >
                  {selectedPlan === "per-letter" && (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${selectedPlan === "per-letter" ? "text-primary" : "text-white/60"}`}
                >
                  Pay-Per-Letter
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1 pl-9">
                <span className="font-heading text-5xl font-semibold tracking-tight text-white">
                  $29.99
                </span>
                <span className="text-lg text-white/65">/letter</span>
              </div>
              <p className="mt-2 pl-9 text-sm text-white/70">
                One urgent letter · No subscription
              </p>
            </button>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#2f2a23] p-6 text-white shadow-sm lg:max-w-none">
            <Button
              asChild
              className="h-[4.25rem] w-full rounded-[1.25rem] bg-primary px-6 text-xl font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Link href="/dashboard">
                {selectedPlan === "yearly"
                  ? "Start 3-Day Free Trial"
                  : "Continue"}
              </Link>
            </Button>

            <p className="mt-5 text-center text-[0.8rem] text-muted-foreground">
              Secured by Stripe · 7-day money-back guarantee
            </p>

            <div className="mt-5 text-center">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Not now — sign out
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
