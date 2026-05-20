"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/shared/navbar-logo";
import {
  Check,
  FileText,
  Mail,
  MessageCircle,
  Scale,
  Shield,
  TrendingUp,
} from "lucide-react";
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in";
import { PricingPlansSection } from "@/components/shared/pricing-plans-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const HERO_IMAGE_SRC = "/tenantshield_hero_image_v2.svg";

const FOOTER_PRODUCT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
  { href: "/billing", label: "Billing" },
] as const;

const FOOTER_LEGAL_LINKS = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
] as const;

function FooterLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const classes = cn(
    "text-sm text-secondary-dark-foreground/75 transition-colors hover:text-primary",
    className,
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI Chat",
    description:
      "24/7 legal research assistant that understands your state's specific tenant laws.",
    iconClass: "text-primary",
    iconWrapClass: "bg-accent",
  },
  {
    icon: FileText,
    title: "Lease Review",
    description:
      "Upload your lease and let AI flag hidden clauses, illegal terms, or unfair fees.",
    iconClass: "text-secondary",
    iconWrapClass: "bg-secondary/15",
  },
  {
    icon: Mail,
    title: "Write Letter",
    description:
      "Generate state-compliant demand letters, repair requests, or dispute notices.",
    iconClass: "text-primary",
    iconWrapClass: "bg-accent",
  },
  {
    icon: Scale,
    title: "Case Review",
    description:
      "Describe your landlord dispute and get an AI breakdown of your legal standing.",
    iconClass: "text-secondary",
    iconWrapClass: "bg-secondary/15",
  },
  {
    icon: TrendingUp,
    title: "Impact Score",
    description:
      "A dashboard that scores your rental situation and overall legal health.",
    iconClass: "text-primary",
    iconWrapClass: "bg-accent",
  },
] as const;

const TRUST_POINTS = [
  "Bank-level encryption for all documents.",
  "Clear jurisdictional compliance checks.",
] as const;

const STEPS = [
  { number: "1", label: "Secure signup" },
  { number: "2", label: "Document upload" },
  { number: "3", label: "Instant analysis" },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 lg:gap-14">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Tenant advocacy · AI-powered
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
              Empower your tenancy with AI-backed legal protection.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
              Navigate complex legal landscapes with confidence. Our jurisdictional AI analyzes
              your lease and delivers actionable insights, including your personalized Impact Score.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button variant="outline" size="lg" className="h-12 rounded-xl px-8" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="cta" size="lg" className="h-12 rounded-xl px-8" asChild>
                <Link href="/signup">Sign up free</Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn className="relative mx-auto w-full">
            <div
              className="pointer-events-none absolute -inset-4 sm:-inset-6 lg:-inset-8"
              aria-hidden
            >
              <div className="absolute inset-[8%] rounded-[2rem] bg-primary/25 blur-3xl sm:blur-[52px]" />
              <div className="absolute inset-[12%] translate-x-3 translate-y-2 rounded-[2rem] bg-secondary/20 blur-3xl sm:blur-[56px]" />
              <div className="absolute inset-0 rounded-[2rem] bg-foreground/4 blur-2xl" />
            </div>
            <Image
              src={HERO_IMAGE_SRC}
              alt="TenantShield hero illustration"
              width={690}
              height={460}
              priority
              className="relative aspect-4/3 w-full rounded-3xl border border-border/80 bg-card object-contain shadow-lg shadow-foreground/5 ring-1 ring-border/60"
            />
          </FadeIn>
        </div>
      </section>

      <section id="features" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-10 text-center md:mb-12">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Intelligent advocacy
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Tools designed to provide clarity and security for renters.
            </p>
          </FadeIn>

          <FadeInStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-5">
            {FEATURES.map(({ icon: Icon, title, description, iconClass, iconWrapClass }) => (
              <FadeIn key={title} stagger>
                <Card className="h-full gap-0 rounded-3xl border border-border py-0 shadow-none ring-0 transition hover:bg-accent/40">
                  <div className="p-5 sm:p-6">
                    <span
                      className={cn(
                        "mb-4 inline-flex rounded-full p-3",
                        iconWrapClass,
                      )}
                    >
                      <Icon className={cn("size-6", iconClass)} aria-hidden />
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </FadeInStagger>
        </div>
      </section>

      <section id="about" className="bg-secondary-dark px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="py-2 sm:py-4">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-secondary-dark-foreground/10">
                  <Shield className="size-5 text-secondary-dark-foreground" aria-hidden />
                </div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-secondary-dark-foreground sm:text-4xl">
                  No surprise charges. Total transparency.
                </h2>
                <p className="mt-3 text-base leading-relaxed text-secondary-dark-foreground/80 sm:text-lg">
                  Secure onboarding, protected documents, and pricing you can see before you
                  commit.
                </p>
              </div>

              <ul className="mx-auto mt-8 flex w-fit max-w-lg flex-col gap-4 sm:mt-10">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-left">
                    <Check
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <p className="text-sm font-medium leading-snug text-secondary-dark-foreground sm:text-base">
                      {point}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-secondary-dark-foreground/15 pt-8 sm:mt-10">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-secondary-dark-foreground/60">
                  How it works
                </p>
                <ol className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
                  {STEPS.map(({ number, label }) => (
                    <li key={number} className="text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary font-heading text-lg font-semibold text-secondary-dark-foreground shadow-sm sm:size-12">
                        {number}
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-snug text-secondary-dark-foreground sm:text-sm">
                        {label}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <PricingPlansSection className="bg-background" showBillingPeriodToggle />

      <footer className="bg-secondary-dark px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 font-heading text-xl font-semibold text-secondary-dark-foreground"
              >
                <BrandLogo variant="icon" />
                TenantShield
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-secondary-dark-foreground/75">
                AI-backed tenant advocacy — lease review, case analysis, demand letters, and
                anonymous property ratings.
              </p>
              <Button
                variant="cta"
                size="sm"
                className="mt-6 rounded-full px-5"
                asChild
              >
                <Link href="/signup">Get started free</Link>
              </Button>
            </div>

            <div className="lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-dark-foreground/55">
                Product
              </p>
              <ul className="mt-4 space-y-3">
                {FOOTER_PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-dark-foreground/55">
                Legal
              </p>
              <ul className="mt-4 space-y-3">
                {FOOTER_LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-secondary-dark-foreground/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-secondary-dark-foreground/65">
              © {new Date().getFullYear()} TenantShield. All rights reserved.
            </p>
            <p className="text-xs text-secondary-dark-foreground/50">
              Powered by Jurisdictional AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
