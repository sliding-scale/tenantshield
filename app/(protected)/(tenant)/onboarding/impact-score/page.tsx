"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ShieldLoader } from "@/components/shared/shield-loader";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TermsModal } from "@/components/tenant/terms-modal";
import type { ImpactLabel } from "@/lib/onboarding/impactScore";
import { cn } from "@/lib/utils";

const labelStyles: Record<ImpactLabel, string> = {
  "Low impact": "bg-secondary text-secondary-foreground",
  "Moderate impact": "bg-muted text-foreground ring-1 ring-border",
  "Significant impact": "bg-primary text-primary-foreground",
  "Critical situation": "bg-foreground text-background",
};

const impactCopy: Record<
  ImpactLabel,
  {
    title: string;
    body: string;
  }
> = {
  "Low impact": {
    title: "You still have time to stay ahead.",
    body: "This issue is manageable now, but early action prevents escalation and protects your leverage.",
  },
  "Moderate impact": {
    title: "This is starting to weigh on you.",
    body: "Addressing it now can stop it from becoming costly or harder to resolve later.",
  },
  "Significant impact": {
    title: "You're carrying more than you should.",
    body: "The weight of this situation is building. Most renters tell us they wish they'd acted sooner — every week of delay makes resolution harder.",
  },
  "Critical situation": {
    title: "This needs immediate action.",
    body: "Your responses indicate serious risk. Taking action now can reduce legal and financial damage.",
  },
};

const featureItems = [
  "Exact statutes that apply to YOUR situation",
  "A printable demand letter, drafted tonight",
  "An AI that answers any follow-up in seconds",
  "A clear 24-hour action plan",
] as const;

function FeatureList({ className }: { className?: string }) {
  return (
    <ul className={cn("space-y-4", className)}>
      {featureItems.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-dark text-primary sm:size-9">
            <Check className="size-4 sm:size-[1.125rem]" aria-hidden />
          </span>
          <span className="pt-0.5 text-base leading-snug text-foreground sm:text-lg">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ImpactScorePage() {
  const router = useRouter();
  const { clerkUser, role, isLoading: userLoading } = useCurrentUser();
  const impact = useQuery(
    api.onboarding.queries.getImpactScore,
    clerkUser ? {} : "skip",
  );
  const onboardingStatus = useQuery(
    api.onboarding.queries.onboardingStatus,
    clerkUser ? {} : "skip",
  );

  useEffect(() => {
    if (!clerkUser) return;
    if (role && role !== "tenant") {
      router.replace("/dashboard");
      return;
    }
    if (onboardingStatus && onboardingStatus.shouldShowOnboarding) {
      router.replace("/onboarding");
    }
  }, [clerkUser, role, onboardingStatus, router]);

  if (userLoading || impact === undefined || onboardingStatus === undefined) {
    return <ShieldLoader variant="onboarding" fullPage className="min-h-[70vh]" />;
  }

  if (!clerkUser || role !== "tenant") {
    return null;
  }

  if (!impact) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto flex w-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-6 lg:max-w-4xl lg:px-8 lg:py-20">
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Impact score not ready yet
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Complete onboarding first so we can calculate your score.
          </p>
          <div className="mt-10">
            <Button asChild className="h-12 rounded-xl px-8 text-base font-semibold">
              <Link href="/onboarding">Continue onboarding</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const label = impact.impactLabel as ImpactLabel;
  const score = impact.impactScore;
  const style = labelStyles[label] ?? labelStyles["Significant impact"];
  const copy = impactCopy[label] ?? impactCopy["Significant impact"];

  return (
    <main className="w-full bg-background max-lg:min-h-svh lg:flex lg:h-svh lg:max-h-svh lg:min-h-0 lg:flex-col lg:overflow-hidden">
      {/* Mobile */}
      <div className="mx-auto w-full max-w-md px-5 pb-14 pt-8 sm:px-6 lg:hidden">
        <div
          className={cn(
            "inline-flex rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em]",
            style,
          )}
        >
          {label}
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Your impact score
        </p>

        <p className="mt-3 font-heading text-7xl font-semibold leading-none tracking-tight text-foreground sm:text-8xl">
          {score}
          <span className="ml-1 align-baseline font-heading text-4xl font-medium text-muted-foreground sm:text-5xl">
            /100
          </span>
        </p>

        <h1 className="mt-10 font-heading text-4xl font-semibold leading-[1.12] text-foreground sm:text-[2.35rem]">
          {copy.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {copy.body}
        </p>

        <div className="my-8 border-t border-border" />

        <p className="font-heading text-2xl font-semibold leading-snug text-foreground sm:text-[1.65rem]">
          Renters like you typically recover 3–5x more than the cost of the service, in
          one letter.
        </p>

        <FeatureList className="mt-8" />

        <h2 className="mt-10 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Are you ready to take action?
        </h2>

        <Button asChild className="mt-8 h-14 w-full rounded-2xl text-base font-semibold">
          <Link href="/onboarding/plans">Yes — Let&apos;s Do This</Link>
        </Button>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden h-full min-h-0 w-full max-w-8xl flex-col px-3 py-2 sm:px-5 sm:py-3 lg:flex lg:px-8 lg:py-3">
        <Card className="min-h-0 flex-1 gap-0 overflow-hidden rounded-3xl border border-border py-0 shadow-none ring-0">
          <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(240px,36%)_1fr] lg:grid-rows-1 lg:gap-0 xl:grid-cols-[minmax(260px,34%)_1fr]">
            <div className="flex min-h-0 flex-1 flex-col justify-center border-b border-border bg-muted/30 px-5 py-5 sm:px-6 sm:py-6 lg:border-b-0 lg:border-r lg:py-5 xl:px-8">
              <div
                className={cn(
                  "w-fit rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.2em]",
                  style,
                )}
              >
                {label}
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground sm:mt-5 sm:text-sm sm:tracking-[0.28em]">
                Your impact score
              </p>

              <p className="mt-2 font-heading text-6xl font-semibold leading-none text-foreground sm:mt-3 sm:text-7xl lg:text-6xl xl:text-7xl">
                {score}
                <span className="ml-1.5 align-baseline text-3xl font-medium text-muted-foreground sm:ml-2 sm:text-4xl lg:text-4xl xl:text-5xl">
                  /100
                </span>
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-5 py-5 sm:px-6 sm:py-6 lg:py-5 xl:px-8 xl:pl-10">
              <h1 className="font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:max-w-2xl lg:text-[2rem] lg:leading-[1.15] xl:text-[2.25rem]">
                {copy.title}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg lg:mt-3 lg:text-base xl:text-lg">
                {copy.body}
              </p>

              <div className="my-4 max-w-2xl border-t border-border sm:my-5 lg:my-4" />

              <p className="max-w-2xl font-heading text-lg font-semibold leading-snug text-foreground sm:text-xl lg:text-[1.125rem] xl:max-w-3xl xl:text-xl xl:leading-snug">
                Renters like you typically recover 3-5x more than the cost of the service,
                in one letter.
              </p>

              <FeatureList className="mt-4 sm:mt-5 lg:mt-4" />

              <h2 className="mt-4 font-heading text-2xl font-semibold leading-tight text-foreground sm:mt-5 sm:text-3xl lg:mt-4 lg:max-w-xl lg:text-[1.625rem] xl:max-w-2xl xl:text-3xl">
                Are you ready to take action?
              </h2>

              <div className="mt-4 flex max-w-xl flex-col gap-2 pb-1 sm:mt-5 sm:flex-row sm:items-center sm:gap-3 lg:mt-4">
                <Button asChild className="h-11 min-h-11 flex-1 rounded-xl px-6 text-sm font-semibold sm:h-12 sm:flex-none sm:px-8 sm:text-base">
                  <Link href="/onboarding/plans">Yes — Let&apos;s Do This</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <TermsModal />
    </main>
  );
}
