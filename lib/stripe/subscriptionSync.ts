/**
 * Pure Stripe subscription helpers (safe to import from Convex "use node" and from tests).
 * Shared between webhook action and unit tests.
 */

/** Stripe may send Unix seconds as number or string on webhook payloads. */
export function toUnixSeconds(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export type StripeLikePeriodSource = {
  items?: { data?: Array<Record<string, unknown>> }
} & Record<string, unknown>

/**
 * Billing period bounds in ms since epoch.
 * Stripe basil+ exposes periods on subscription items; older API used the subscription root.
 */
export function readStripeSubscriptionPeriodMs(sub: StripeLikePeriodSource): {
  startMs: number
  endMs: number
} | null {
  const firstItem = sub.items?.data?.[0]
  const candidates: unknown[] = [firstItem, sub]

  for (const obj of candidates) {
    if (!obj || typeof obj !== "object") continue
    const record = obj as Record<string, unknown>
    const startSec = toUnixSeconds(record["current_period_start"])
    const endSec = toUnixSeconds(record["current_period_end"])
    if (startSec !== null && endSec !== null) {
      return { startMs: startSec * 1000, endMs: endSec * 1000 }
    }
  }

  return null
}

/** Portal cancel-at-period-end; webhook payloads may omit fields unless the full object is loaded. */
export function readCancelAtPeriodEnd(sub: StripeLikePeriodSource): boolean {
  const record = sub as unknown as Record<string, unknown>
  if (record["cancel_at_period_end"] === true) {
    return true
  }

  const status = typeof record["status"] === "string" ? record["status"] : ""
  if (status !== "active" && status !== "trialing" && status !== "past_due") {
    return false
  }

  const cancelAtSec = toUnixSeconds(record["cancel_at"])
  const period = readStripeSubscriptionPeriodMs(sub)
  if (cancelAtSec !== null && period !== null) {
    const cancelAtMs = cancelAtSec * 1000
    if (Math.abs(cancelAtMs - period.endMs) <= 86_400_000) {
      return true
    }
  }

  return false
}

export function grantsStripePaidAccess(status: string): boolean {
  return (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "paused"
  )
}

/**
 * Retain Convex paid state until the Stripe billing period ends, even if status strings
 * are pessimistic mid-transition (see code review: cancel-at-period-end UX).
 */
export function computeShouldHavePaidPlan(
  stripeStatus: string,
  currentPeriodEndMs: number,
  nowMs: number,
): boolean {
  const periodNotEnded = Number.isFinite(currentPeriodEndMs) && currentPeriodEndMs > nowMs
  return grantsStripePaidAccess(stripeStatus) || periodNotEnded
}
