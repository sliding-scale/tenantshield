'use client';

import Link from 'next/link';
import {
  CreditCard,
  FileText,
  MessageSquareShare,
  PlusCircle,
  Scale,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import useCurrentUser from '@/app/hooks/useCurrentUser';
import { api } from '@/convex/_generated/api';
import { FadeIn, FadeInStagger } from '@/components/shared/fade-in';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { caseStrengthLabel } from '@/lib/case/caseStrengthLabel';
import { MOBILE_TAB_BAR_PAGE_SHELL } from '@/lib/nav/mobile-chrome';
import { resolvePlanId } from '@/lib/plans/plan-access';
import { isPaidPlan } from '@/lib/plans/pricing';
import { cn } from '@/lib/utils';

const quickActions = [
  {
    title: 'New Case',
    subtitle: 'AI strength score',
    href: '/newcase',
    Icon: PlusCircle,
    featured: true,
  },
  {
    title: 'Ask AI',
    subtitle: 'Get instant answers to legal questions',
    href: '/ask-ai',
    Icon: Sparkles,
    featured: false,
  },
  {
    title: 'Write Letter',
    subtitle: 'Generate a demand letter or email',
    href: '/write-letters',
    Icon: FileText,
    featured: false,
  },
  {
    title: 'Analyze Lease',
    subtitle: 'Flag red-flag clauses',
    href: '/analyze-lease',
    Icon: MessageSquareShare,
    featured: false,
  },
  {
    title: 'State Laws',
    subtitle: 'Browse renter rights',
    href: '/state-laws',
    Icon: Scale,
    featured: false,
  },
  {
    title: 'Profile',
    subtitle: 'Your details & preferences',
    href: '/profile',
    Icon: UserRound,
    featured: false,
  },
  {
    title: 'Give Rating',
    subtitle: 'Rate a landlord or property',
    href: '/ratings',
    Icon: Star,
    featured: false,
  },
  {
    title: 'Billing',
    subtitle: 'Manage your plan',
    href: '/billing',
    Icon: CreditCard,
    featured: false,
  },
] as const;

export default function TenantDashboardMain() {
  const { convexUser, clerkUser } = useCurrentUser();
  const counts = useQuery(api.dashboard.queries.countsForCurrentUser);
  const planUsage = useQuery(api.planUsage.queries.current, {});

  if (!convexUser || convexUser.role !== 'tenant') {
    return <div>You are not authorized to access this page</div>;
  }

  const userName = clerkUser?.firstName || convexUser.name || 'there';
  const plan = resolvePlanId(planUsage?.plan ?? convexUser.plan);
  const showProBadge = isPaidPlan(plan);
  const protectionIndex = Math.round(counts?.protectionIndex ?? 0);
  const protectionLabel = caseStrengthLabel(protectionIndex).toUpperCase();
  const protectionAngle = Math.max(0, Math.min(360, (protectionIndex / 100) * 360));

  return (
    <main
      className={cn(
        'min-h-svh bg-background px-4 text-foreground md:min-h-svh md:px-8 md:pb-10 md:pt-8 lg:px-10',
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <FadeIn>
          <section className="mb-6 flex items-start justify-between gap-3 md:mb-8">
            <div>
              <p className="text-sm text-muted-foreground md:text-base">Good to see you,</p>
              <h1 className="font-heading text-4xl font-semibold capitalize leading-tight text-foreground md:text-5xl">
                {userName}.
              </h1>
            </div>
            {showProBadge ? (
              <Badge className="mt-1 h-auto shrink-0 gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide">
                <Star className="size-4 fill-current" aria-hidden />
                Pro
              </Badge>
            ) : null}
          </section>
        </FadeIn>

        <FadeIn>
          <section aria-labelledby="protection-index-heading">
            <Card className="gap-0 rounded-3xl border-none bg-foreground py-0 text-background shadow-lg ring-0 md:p-0">
              <div className="p-5 md:p-7 lg:px-10 lg:py-8 xl:px-12 xl:py-9">
                <p
                  id="protection-index-heading"
                  className="text-xs font-semibold uppercase tracking-[0.24em] text-primary"
                >
                  Protection Index
                </p>
                <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-4 sm:flex sm:flex-row sm:items-end sm:justify-between lg:items-center">
                  <div className="min-w-0 max-w-[14.5rem] sm:max-w-[20rem] lg:max-w-[52rem]">
                    <h2 className="font-heading text-[1.3rem] font-semibold leading-[1.06] text-background sm:text-[2.2rem] lg:text-[2.8rem] lg:leading-[0.98]">
                      Your case strength across all active disputes.
                    </h2>
                    <div className="col-span-2 mt-5 flex gap-3 sm:mt-4">
                      <StatPill value={String(counts?.activeCases ?? 0)} label="Cases" />
                      <StatPill value={String(counts?.letters ?? 0)} label="Letters" />
                    </div>
                  </div>
                  <ProtectionGauge
                    protectionIndex={protectionIndex}
                    protectionLabel={protectionLabel}
                    protectionAngle={protectionAngle}
                  />
                </div>
              </div>
            </Card>
          </section>
        </FadeIn>

        <section className="mt-8" aria-labelledby="take-action-heading">
          <FadeIn>
            <p
              id="take-action-heading"
              className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground"
            >
              Take Action
            </p>
          </FadeIn>
          <FadeInStagger className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-8 md:gap-4">
            {quickActions.map(({ title, subtitle, href, Icon, featured }) => (
              <FadeIn key={title} stagger className="md:col-span-2">
                <Link href={href} className="group block h-full">
                  <Card
                    className={cn(
                      'h-full min-h-[7.75rem] gap-3 rounded-3xl border-none py-4 transition sm:min-h-[8.25rem] md:min-h-0',
                      featured
                        ? 'bg-foreground text-background ring-0 hover:bg-foreground/90'
                        : 'bg-card text-foreground hover:shadow-md',
                    )}
                  >
                    <div className="flex h-full flex-col gap-2 px-4">
                      <div
                        className={cn(
                          'inline-flex size-9 shrink-0 items-center justify-center rounded-xl',
                          featured ? 'bg-primary text-foreground' : 'bg-accent text-foreground',
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col gap-1">
                        <h3
                          className={cn(
                            'font-heading text-base font-semibold leading-snug sm:text-xl md:text-3xl md:leading-tight',
                            featured ? 'text-background' : 'text-foreground',
                          )}
                        >
                          {title}
                        </h3>
                        <p
                          className={cn(
                            'line-clamp-2 text-xs leading-relaxed break-words sm:text-sm md:line-clamp-none',
                            featured ? 'text-background/75' : 'text-muted-foreground',
                          )}
                        >
                          {subtitle}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </FadeIn>
            ))}
          </FadeInStagger>
        </section>
      </div>
    </main>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-background/15 px-4 py-3 text-center sm:px-5 sm:py-4">
      <p className="font-heading text-2xl font-semibold leading-none text-background sm:text-4xl">
        {value}
      </p>
      <p className="mt-1 text-[8px] uppercase text-background/80 sm:text-sm">{label}</p>
    </div>
  );
}

function ProtectionGauge({
  protectionIndex,
  protectionLabel,
  protectionAngle,
}: {
  protectionIndex: number;
  protectionLabel: string;
  protectionAngle: number;
}) {
  return (
    <div
      className="grid size-[8.5rem] shrink-0 place-items-center self-start rounded-full sm:size-[14rem] lg:size-[16.5rem]"
      style={{
        background: `conic-gradient(from -90deg, var(--primary) 0deg ${protectionAngle}deg, var(--border) ${protectionAngle}deg 360deg)`,
      }}
      role="img"
      aria-label={`Protection index ${protectionIndex}, ${protectionLabel.toLowerCase()}`}
    >
      <div className="grid size-[7rem] place-items-center rounded-full bg-foreground sm:size-[12.1rem] lg:size-[14.25rem]">
        <span className="max-w-[5rem] text-center font-heading text-sm font-semibold uppercase leading-tight tracking-[0.12em] text-background sm:max-w-[7rem] sm:text-lg lg:text-xl">
          {protectionLabel}
        </span>
      </div>
    </div>
  );
}
