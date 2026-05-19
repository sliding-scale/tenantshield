import { format } from "date-fns"

export function formatSubscriptionEndDate(endsAtMs: number) {
  return format(new Date(endsAtMs), "MMMM d, yyyy")
}

/** Copy when Stripe `cancel_at_period_end` is true and access continues until period end. */
export function subscriptionCancellationMessage(
  cancelAtPeriodEnd: boolean,
  currentPeriodEndMs: number,
): string | null {
  if (!cancelAtPeriodEnd || !Number.isFinite(currentPeriodEndMs)) return null
  return `Your subscription ends on ${formatSubscriptionEndDate(currentPeriodEndMs)}. You keep full access until then.`
}
