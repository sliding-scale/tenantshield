import { describe, expect, it } from "vitest"
import {
  computeShouldHavePaidPlan,
  grantsStripePaidAccess,
  readCancelAtPeriodEnd,
  readStripeSubscriptionPeriodMs,
  toUnixSeconds,
} from "./subscriptionSync"

describe("toUnixSeconds", () => {
  it("parses finite numbers and numeric strings", () => {
    expect(toUnixSeconds(1700000000)).toBe(1700000000)
    expect(toUnixSeconds("1700000000")).toBe(1700000000)
    expect(toUnixSeconds("")).toBeNull()
    expect(toUnixSeconds(undefined)).toBeNull()
  })
})

describe("readStripeSubscriptionPeriodMs", () => {
  it("reads from first subscription item", () => {
    const sub = {
      items: {
        data: [{ current_period_start: 1_700_000_000, current_period_end: 1_700_086_400 }],
      },
    }
    expect(readStripeSubscriptionPeriodMs(sub)).toEqual({
      startMs: 1_700_000_000_000,
      endMs: 1_700_086_400_000,
    })
  })

  it("falls back to root subscription fields", () => {
    const sub = {
      items: { data: [] },
      current_period_start: 100,
      current_period_end: 200,
    }
    expect(readStripeSubscriptionPeriodMs(sub)).toEqual({
      startMs: 100_000,
      endMs: 200_000,
    })
  })
})

describe("readCancelAtPeriodEnd", () => {
  it("returns true when cancel_at_period_end flag is set", () => {
    expect(
      readCancelAtPeriodEnd({
        cancel_at_period_end: true,
        status: "active",
      }),
    ).toBe(true)
  })

  it("infers cancel at period end when cancel_at aligns with period end", () => {
    const endSec = 1_700_086_400
    expect(
      readCancelAtPeriodEnd({
        cancel_at_period_end: false,
        status: "active",
        cancel_at: endSec,
        current_period_start: endSec - 86_400,
        current_period_end: endSec,
      }),
    ).toBe(true)
  })

  it("returns false for terminal status without flag", () => {
    expect(
      readCancelAtPeriodEnd({
        cancel_at_period_end: false,
        status: "canceled",
      }),
    ).toBe(false)
  })
})

describe("computeShouldHavePaidPlan", () => {
  const end = 1_800_000_000_000

  it("keeps access while billing period not ended even if status is canceled", () => {
    expect(computeShouldHavePaidPlan("canceled", end, end - 1000)).toBe(true)
  })

  it("revokes when period ended and status does not grant access", () => {
    expect(computeShouldHavePaidPlan("canceled", end, end + 1000)).toBe(false)
  })

  it("matches grantsStripePaidAccess when period ended but status is active", () => {
    expect(computeShouldHavePaidPlan("active", end, end + 1000)).toBe(true)
    expect(grantsStripePaidAccess("active")).toBe(true)
  })
})
