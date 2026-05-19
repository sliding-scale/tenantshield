'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAction, useQuery } from 'convex/react';
import { Check, CreditCard } from 'lucide-react';
import useCurrentUser from '@/app/hooks/useCurrentUser';
import { useSelectPaidPlan } from '@/app/hooks/useSelectPaidPlan';
import { BrandedAlertDialog } from '@/components/ui/branded-alert-dialog';
import { api } from '@/convex/_generated/api';
import {
  buildPlanCatalogLite,
  formatPlanPrice,
  formatYearlyPlanPrice,
  getPlanCtaHref,
  getPlanPricePeriodSuffix,
  getPlanYearlySavingsPercent,
  isPaidPlan,
  pricingPlansListFromCatalog,
  type BillingPeriod,
  type CheckoutSource,
  type PlanId,
  type PricingAudience,
  type PricingPlan,
} from '@/lib/plans/pricing';
import { subscriptionCancellationMessage } from '@/lib/plans/subscription-display';
import { cn } from '@/lib/utils';

type PricingPlansSectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
  audience?: PricingAudience;
  showBillingPeriodToggle?: boolean;
  defaultBillingPeriod?: BillingPeriod;
  /** Where Checkout was opened — sets Stripe cancel_url. */
  checkoutSource?: CheckoutSource;
  className?: string;
};

function BillingPeriodToggle({
  billingPeriod,
  onChange,
}: {
  billingPeriod: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}) {
  return (
    <div
      className='mx-auto mb-10 flex w-full max-w-md flex-col items-center gap-3 sm:mb-12'
      role='group'
      aria-label='Billing period'
    >
      <div className='inline-flex w-full rounded-full border border-cream-border bg-cream-surface p-1 shadow-sm'>
        <button
          type='button'
          onClick={() => onChange('monthly')}
          className={cn(
            'h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors',
            billingPeriod === 'monthly' ? 'bg-surface-strong text-white' : 'text-ink-warm hover:text-foreground',
          )}
        >
          Monthly
        </button>
        <button
          type='button'
          onClick={() => onChange('yearly')}
          className={cn(
            'h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors',
            billingPeriod === 'yearly' ? 'bg-surface-strong text-white' : 'text-ink-warm hover:text-foreground',
          )}
        >
          Yearly
        </button>
      </div>
      <p className='text-sm text-ink-warm-muted'>Save with annual billing on paid plans.</p>
    </div>
  );
}

function PricingPlanCard({
  id: planId,
  name,
  features,
  cta,
  popular,
  trial,
  audience,
  billingPeriod = 'monthly',
  isCurrentPlan = false,
  showManageSubscription = false,
  onManageSubscription,
  isManagingSubscription = false,
  cancellationNotice = null,
  onSelectPlan,
  isSelecting = false,
}: PricingPlan & {
  audience: PricingAudience;
  billingPeriod?: BillingPeriod;
  isCurrentPlan?: boolean;
  showManageSubscription?: boolean;
  onManageSubscription?: () => void;
  isManagingSubscription?: boolean;
  cancellationNotice?: string | null;
  onSelectPlan?: (planId: PlanId) => void;
  isSelecting?: boolean;
}) {
  const displayPrice = formatPlanPrice(planId, billingPeriod);
  const priceSuffix = getPlanPricePeriodSuffix(planId, billingPeriod);
  const yearlyReference = billingPeriod === 'monthly' ? formatYearlyPlanPrice(planId) : null;
  const yearlySavingsPercent = billingPeriod === 'yearly' ? getPlanYearlySavingsPercent(planId) : null;
  const displayFeatures = features;
  const href = getPlanCtaHref(planId, audience);
  const usesBillingSelection =
    (audience === 'billing' || audience === 'onboarding') && planId !== 'free' && Boolean(onSelectPlan);
  const ctaClassName = cn(
    'block w-full rounded-full px-4 py-3 text-center text-sm font-bold transition-all duration-200 active:scale-95',
    popular
      ? 'bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:shadow-lg'
      : 'border-2 border-gray-300 bg-white text-gray-700 hover:border-amber-500 hover:text-amber-600',
  );

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 bg-white p-6 transition-all duration-300 sm:p-8',
        isCurrentPlan
          ? 'border-primary shadow-md ring-2 ring-primary/15'
          : popular
            ? 'border-amber-500 hover:border-amber-500 hover:shadow-lg'
            : 'border-gray-200 hover:border-amber-200 hover:shadow-lg',
      )}
    >
      {isCurrentPlan ? (
        <div
          className={cn(
            'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold shadow-md',
            cancellationNotice ? 'bg-surface-strong text-cream-surface-soft' : 'bg-primary text-primary-foreground',
          )}
        >
          {cancellationNotice ? 'Ends soon' : 'Current plan'}
        </div>
      ) : popular ? (
        <div className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md'>
          Most Popular
        </div>
      ) : null}

      {yearlySavingsPercent ? (
        <div className='absolute top-4 right-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800'>
          Save {yearlySavingsPercent}%
        </div>
      ) : null}

      <h3 className='mb-2 text-xl font-bold text-gray-900'>{name}</h3>

      <div className='mb-6'>
        <span className='text-3xl font-bold text-gray-900'>{displayPrice}</span>
        {priceSuffix ? <span className='text-sm text-gray-600'>{priceSuffix}</span> : null}
        {yearlyReference ? <p className='mt-2 text-sm font-medium text-gray-600'>{yearlyReference}</p> : null}
        {trial && billingPeriod === 'monthly' ? (
          <p className='mt-2 text-xs font-medium text-gray-500'>{trial}</p>
        ) : null}
      </div>

      <ul className='mb-8 space-y-3'>
        {displayFeatures.map((feature) => (
          <li key={feature} className='flex items-center gap-2'>
            <Check className='h-5 w-5 shrink-0 text-emerald-600' />
            <span className='text-sm text-gray-600'>{feature}</span>
          </li>
        ))}
      </ul>

      {cancellationNotice ? (
        <p className='mb-4 rounded-lg border border-cream-border bg-cream-surface px-3 py-2.5 text-center text-sm leading-snug text-ink-warm-muted'>
          {cancellationNotice}
        </p>
      ) : null}

      {isCurrentPlan && showManageSubscription ? (
        <button
          type='button'
          disabled={isManagingSubscription}
          onClick={(event) => {
            event.stopPropagation();
            onManageSubscription?.();
          }}
          className={cn(
            'block w-full rounded-full px-4 py-3 text-center text-sm font-bold transition-all duration-200 active:scale-95',
            popular
              ? 'bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:shadow-lg'
              : 'border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90',
            isManagingSubscription && 'cursor-wait opacity-80',
          )}
          aria-current='true'
        >
          {isManagingSubscription ? 'Opening…' : 'Manage subscription'}
        </button>
      ) : isCurrentPlan ? (
        <div
          className={cn(
            'block w-full rounded-full px-4 py-3 text-center text-sm font-bold',
            popular ? 'bg-amber-500/80 text-white shadow-md' : 'border-2 border-gray-300 bg-gray-50 text-gray-500',
          )}
          aria-current='true'
        >
          Current plan
        </div>
      ) : usesBillingSelection ? (
        <button
          type='button'
          disabled={isSelecting}
          onClick={(event) => {
            event.stopPropagation();
            void onSelectPlan?.(planId);
          }}
          className={cn(ctaClassName, isSelecting && 'cursor-wait opacity-80')}
        >
          {isSelecting ? 'Updating...' : cta}
        </button>
      ) : (
        <Link href={href} className={ctaClassName}>
          {cta}
        </Link>
      )}
    </div>
  );
}

export function PricingPlansSection({
  id = 'pricing',
  title = 'Start Your Protection Today',
  subtitle = 'Choose the level of advocacy that fits your rental needs. Protect yourself from unfair practices.',
  hideHeader = false,
  audience = 'landing',
  showBillingPeriodToggle = false,
  defaultBillingPeriod,
  checkoutSource,
  className,
}: PricingPlansSectionProps) {
  const { clerkUser, isLoading } = useCurrentUser();
  const { selectPaidPlan } = useSelectPaidPlan();
  const openBillingPortal = useAction(api.stripe.node.createBillingPortalSession);
  const catalogRows = useQuery(api.planCatalog.queries.list, {});
  const planUsage = useQuery(api.planUsage.queries.current, clerkUser ? {} : 'skip');
  const displayPlans = useMemo(
    () => pricingPlansListFromCatalog(buildPlanCatalogLite(catalogRows ?? [])),
    [catalogRows],
  );
  const activeUserPlanId = clerkUser && !isLoading && planUsage != null ? planUsage.plan : null;
  const activeBillingPeriod = planUsage?.planType ?? null;
  const userHasActivePaidPlan =
    Boolean(clerkUser) && !isLoading && planUsage != null && isPaidPlan(planUsage.plan);
  const hasActivePaidSubscription =
    audience === 'billing' && activeUserPlanId !== null && isPaidPlan(activeUserPlanId);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [pendingPlanId, setPendingPlanId] = useState<PlanId | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [activeSubOtherPlanDialogOpen, setActiveSubOtherPlanDialogOpen] = useState(false);
  const hasAppliedDefaultBillingPeriod = useRef(false);

  const handleManageSubscription = useCallback(async () => {
    setPortalLoading(true);
    try {
      const { url } = await openBillingPortal({});
      window.location.assign(url);
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert(error instanceof Error ? error.message : 'Could not open billing portal. Try again in a moment.');
    } finally {
      setPortalLoading(false);
    }
  }, [openBillingPortal]);

  const isPlanCurrentForUser = useCallback(
    (planId: PlanId, period: BillingPeriod) => {
      if (activeUserPlanId !== planId) return false;
      if (planId === 'free') return true;
      if (!showBillingPeriodToggle || activeBillingPeriod === null) return true;
      return period === activeBillingPeriod;
    },
    [activeBillingPeriod, activeUserPlanId, showBillingPeriodToggle],
  );

  const subscriptionEndsNotice = useMemo(() => {
    if (!planUsage?.cancelAtPeriodEnd || planUsage.currentPeriodEnd === undefined) {
      return null;
    }
    return subscriptionCancellationMessage(true, planUsage.currentPeriodEnd);
  }, [planUsage]);

  useEffect(() => {
    if (!showBillingPeriodToggle || hasAppliedDefaultBillingPeriod.current || defaultBillingPeriod === undefined) {
      return;
    }

    setBillingPeriod(defaultBillingPeriod);
    hasAppliedDefaultBillingPeriod.current = true;
  }, [defaultBillingPeriod, showBillingPeriodToggle]);
  const handleSelectPlan = async (planId: PlanId) => {
    if ((audience !== 'billing' && audience !== 'onboarding') || planId === 'free') return;

    const switchingFromActivePaid =
      userHasActivePaidPlan && !isPlanCurrentForUser(planId, billingPeriod);
    if (switchingFromActivePaid) {
      setActiveSubOtherPlanDialogOpen(true);
      return;
    }

    setPendingPlanId(planId);
    try {
      const source = checkoutSource ?? (audience === 'billing' ? 'billing' : 'onboarding');
      await selectPaidPlan({ plan: planId, planType: billingPeriod, checkoutSource: source });
    } finally {
      setPendingPlanId(null);
    }
  };

  const carouselIndexForPlan = useCallback(
    (planId: PlanId | null) => {
      if (displayPlans.length === 0) return 0;
      if (planId) {
        const match = displayPlans.findIndex((plan) => plan.id === planId);
        if (match >= 0) return match;
      }
      const popularIndex = displayPlans.findIndex((plan) => plan.popular);
      return popularIndex >= 0 ? popularIndex : 0;
    },
    [displayPlans],
  );

  const [carouselIndex, setCarouselIndex] = useState(0);
  const lastCarouselSyncedPlanId = useRef<PlanId | 'anonymous' | null>(null);
  const touchStartedOnInteractive = useRef(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (displayPlans.length === 0) return;
    if (audience === 'billing' && clerkUser && (isLoading || planUsage == null)) {
      return;
    }

    const syncKey: PlanId | 'anonymous' = activeUserPlanId ?? 'anonymous';
    if (lastCarouselSyncedPlanId.current === syncKey) return;

    setCarouselIndex(carouselIndexForPlan(activeUserPlanId));
    lastCarouselSyncedPlanId.current = syncKey;
  }, [activeUserPlanId, audience, carouselIndexForPlan, clerkUser, displayPlans.length, isLoading, planUsage]);

  const handleTouchStart = (event: React.TouchEvent) => {
    const target = event.target;
    touchStartedOnInteractive.current =
      target instanceof Element && Boolean(target.closest("button, a, [role='button'], input, textarea, select"));
    touchStartX.current = event.targetTouches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartedOnInteractive.current) {
      touchStartedOnInteractive.current = false;
      return;
    }

    const delta = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(delta) < 50) return;

    if (delta > 0) {
      setCarouselIndex((previous) => (previous + 1) % displayPlans.length);
    } else {
      setCarouselIndex((previous) => (previous - 1 + displayPlans.length) % displayPlans.length);
    }
  };

  return (
    <section id={id} className={cn('px-4 py-20 sm:px-6 lg:px-8', className)}>
      <BrandedAlertDialog
        open={activeSubOtherPlanDialogOpen}
        onOpenChange={setActiveSubOtherPlanDialogOpen}
        eyebrow='Active subscription'
        eyebrowVariant='primary'
        icon={<CreditCard className='size-7 text-primary sm:size-8' />}
        iconVariant='primary'
        title='You already have a subscription'
        description='Plan changes and billing are handled in the secure customer portal. Open it to switch tiers, update payment, or cancel.'
        cancelLabel='Not now'
        actionLabel='Manage subscription'
        actionVariant='surface-strong'
        isActionLoading={portalLoading}
        onAction={() => {
          void handleManageSubscription();
        }}
      />
      <div className='mx-auto max-w-6xl'>
        {!hideHeader ? (
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold tracking-tight text-ink-warm'>{title}</h2>
            <p className='text-lg text-ink-warm-muted'>{subtitle}</p>
          </div>
        ) : null}

        {showBillingPeriodToggle ? (
          <BillingPeriodToggle billingPeriod={billingPeriod} onChange={setBillingPeriod} />
        ) : null}

        <div className={cn('lg:hidden', audience === 'billing' && 'pb-2')}>
          <div className='overflow-x-hidden pt-5' onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div
              className='flex transition-transform duration-300 ease-out'
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {displayPlans.map((plan) => {
                const cardPeriod = showBillingPeriodToggle ? billingPeriod : 'monthly';
                const isCurrent = isPlanCurrentForUser(plan.id, cardPeriod);
                return (
                  <div key={plan.id} className='w-full shrink-0 px-4'>
                    <PricingPlanCard
                      {...plan}
                      audience={audience}
                      billingPeriod={cardPeriod}
                      isCurrentPlan={isCurrent}
                      showManageSubscription={hasActivePaidSubscription && isCurrent && isPaidPlan(plan.id)}
                      onManageSubscription={() => void handleManageSubscription()}
                      isManagingSubscription={portalLoading}
                      cancellationNotice={isCurrent ? subscriptionEndsNotice : null}
                      onSelectPlan={audience === 'billing' || audience === 'onboarding' ? handleSelectPlan : undefined}
                      isSelecting={pendingPlanId === plan.id}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={cn('mt-6 flex justify-center gap-2', audience === 'billing' && 'mb-4')}>
            {displayPlans.map((plan, index) => {
              const cardPeriod = showBillingPeriodToggle ? billingPeriod : 'monthly';
              const isCurrent = isPlanCurrentForUser(plan.id, cardPeriod);
              return (
                <button
                  key={plan.id}
                  type='button'
                  onClick={() => setCarouselIndex(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === carouselIndex ? 'w-8 bg-primary' : 'w-2 bg-cream-border hover:bg-cream-surface-deep',
                    isCurrent && index !== carouselIndex && 'ring-2 ring-primary/40',
                  )}
                  aria-label={isCurrent ? `Go to ${plan.name} (current plan)` : `Go to ${plan.name}`}
                  aria-current={index === carouselIndex ? 'true' : undefined}
                />
              );
            })}
          </div>
        </div>

        <div className='hidden gap-8 lg:grid lg:grid-cols-3'>
          {displayPlans.map((plan) => {
            const cardPeriod = showBillingPeriodToggle ? billingPeriod : 'monthly';
            const isCurrent = isPlanCurrentForUser(plan.id, cardPeriod);
            return (
              <PricingPlanCard
                key={plan.id}
                {...plan}
                audience={audience}
                billingPeriod={cardPeriod}
                isCurrentPlan={isCurrent}
                showManageSubscription={hasActivePaidSubscription && isCurrent && isPaidPlan(plan.id)}
                onManageSubscription={() => void handleManageSubscription()}
                isManagingSubscription={portalLoading}
                cancellationNotice={isCurrent ? subscriptionEndsNotice : null}
                onSelectPlan={audience === 'billing' || audience === 'onboarding' ? handleSelectPlan : undefined}
                isSelecting={pendingPlanId === plan.id}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
