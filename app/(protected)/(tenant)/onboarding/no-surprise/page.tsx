"use client";

import Link from "next/link";
import { Bell, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const timeline = [
  {
    day: "Today",
    title: "Trial starts",
    description: "Full access to everything — unlimited.",
    active: true,
  },
  {
    day: "Day 2",
    title: "Reminder sent",
    description: "Email + push — cancel anytime from Settings.",
    active: false,
  },
  {
    day: "Day 3",
    title: "Billing begins",
    description: "Only if you love it. Otherwise cancel free.",
    active: false,
  },
];

export default function NoSurprisePage() {
  return (
    <main className="min-h-svh w-full bg-background px-5 pb-8 pt-8 text-foreground md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:min-h-[calc(100vh-4rem)] lg:items-center lg:justify-center lg:gap-14">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center xl:gap-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-white p-6 text-foreground shadow-sm sm:p-8 lg:p-10">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-foreground md:h-28 md:w-28 md:rounded-[3rem]">
                <Bell
                  className="h-12 w-12 fill-primary text-primary md:h-14 md:w-14"
                  strokeWidth={1.5}
                />
              </div>

              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Transparent. Always.
              </p>

              <h1 className="text-balance font-heading text-5xl font-semibold leading-tight text-foreground sm:text-6xl lg:text-7xl">
                No surprise
                <br />
                charges.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                We&apos;ll send you a reminder{" "}
                <strong className="font-semibold text-foreground">
                  24 hours before{" "}
                </strong>
                your free trial ends, so you can decide with no pressure. Cancel
                with two taps. Continue if it&apos;s already saved you hours.
              </p>

              <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-muted/10 p-4 text-left shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    No hidden charges
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You see the cost before anything starts.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/10 p-4 text-left shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Reminder before billing
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enough time to cancel if you want to.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/10 p-4 text-left shadow-sm">
                  <Bell className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    2-tap cancellation
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Simple exit, no support maze.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-border bg-[#2f2a23] p-6 text-white shadow-2xl sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  3-day trial
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold text-white sm:text-4xl">
                  How it works
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
                Cancel anytime
              </div>
            </div>

            <div className="space-y-4">
              {timeline.map((step) => (
                <div
                  key={step.day}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    step.active
                      ? "border-primary/40 bg-white/10"
                      : "border-white/10 bg-white/10"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    {step.day}
                  </p>
                  <p className="mt-2 font-heading text-xl font-semibold text-white">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-relaxed text-white/85">
              We only bill after the full free window ends, and we notify you
              before it happens.
            </div>
          </aside>
        </section>

        <div className="rounded-[2rem] border border-border bg-white p-4 text-foreground shadow-sm lg:mx-auto lg:w-full lg:max-w-lg lg:p-5">
          <Button
            asChild
            className="h-14 w-full rounded-2xl bg-primary px-6 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Link href="/onboarding/plans">See My Subscription</Link>
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Cancel in 2 taps · No auto-charge surprises
          </p>
        </div>
      </div>
    </main>
  );
}
