"use client";

import Link from "next/link";
import { Bell, Gift, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const valuePoints = [
  {
    icon: Zap,
    title: "Immediate access",
    description: "Unlocks the moment you start — nothing is held back.",
  },
  {
    icon: ShieldCheck,
    title: "Cancel anytime",
    description: "You can end the trial before billing with no penalty.",
  },
  {
    icon: Bell,
    title: "We remind you first",
    description: "You get a heads-up before the free period ends.",
  },
];

export default function FreeTrialPage() {
  return (
    <main className="min-h-svh w-full bg-background px-5 pb-10 pt-8 text-foreground md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:min-h-svh lg:items-center lg:justify-center lg:gap-14">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch xl:gap-12">
          <div className="rounded-[2rem] border border-border bg-white p-6 text-foreground shadow-sm sm:p-8 lg:flex lg:flex-col lg:justify-between lg:p-10">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
              <div className="mb-8 mt-2 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-foreground md:h-28 md:w-28 md:rounded-[3rem]">
                <Gift
                  className="h-12 w-12 text-primary md:h-14 md:w-14"
                  strokeWidth={1.5}
                />
              </div>

              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                A gift on us
              </p>

              <h1 className="text-balance font-heading text-[2.75rem] font-semibold leading-none tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Start with 3 days
                <br />
                completely free.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Get the full power of TenantShield — unlimited AI chat,
                unlimited demand letters, lease analyses, and every state&apos;s
                law at your fingertips. No charge for 3 days.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {valuePoints.map((point) => {
                const Icon = point.icon;

                return (
                  <div
                    key={point.title}
                    className="flex min-h-36 flex-col rounded-2xl border border-border bg-muted/10 p-5 shadow-sm"
                  >
                    <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                    <p className="mt-4 text-sm font-semibold text-foreground">
                      {point.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="overflow-hidden rounded-[2rem] border border-border bg-[#2f2a23] text-white shadow-2xl">
            <div className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8 lg:p-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  What you get
                </div>
                <h2 className="mt-5 max-w-md font-heading text-3xl font-semibold text-white sm:text-4xl">
                  Everything opens up immediately.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                  The trial is the full product, not a demo. Use the tools,
                  review your lease, and see the value before billing ever
                  starts.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  "Unlimited AI chat, letters, and lease analyses",
                  "All 50 states + DC tenant rights coverage",
                  "A reminder before the trial transitions to billing",
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="rounded-2xl border border-white/10 bg-white/10 p-5 text-sm leading-relaxed text-white/85"
                  >
                    {benefit}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-sm leading-relaxed text-white/85">
                &quot;I got my $2,800 deposit back in 11 days using one of their
                letters. This app paid for itself hundreds of times over.&quot;
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Maya R., Oakland CA
                </p>
              </div>
            </div>
          </aside>
        </section>

        <div className="rounded-[2rem] border border-border bg-white p-4 text-foreground shadow-sm sm:p-5 lg:mx-auto lg:w-full lg:max-w-2xl lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Next step
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Move into the no-surprise screen before choosing a plan.
              </p>
            </div>
            <Button
              asChild
              className="h-14 w-full rounded-2xl bg-primary px-6 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              <Link href="/onboarding/no-surprise">Continue</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
