import { describe, expect, it } from "vitest"
import { letterLeaseCountsForSameStripeSubscription } from "./usageCounterCarryover"

describe("letterLeaseCountsForSameStripeSubscription", () => {
  it("resets letters/leases on tier change", () => {
    expect(
      letterLeaseCountsForSameStripeSubscription({
        existingPlan: "pro",
        incomingPlan: "power",
        periodChanged: false,
        usedLetters: 2,
        usedLeaseAnalyses: 1,
      }),
    ).toEqual({ usedLetters: 0, usedLeaseAnalyses: 0 })
  })

  it("resets on monthly period change", () => {
    expect(
      letterLeaseCountsForSameStripeSubscription({
        existingPlan: "pro",
        incomingPlan: "pro",
        periodChanged: true,
        usedLetters: 2,
        usedLeaseAnalyses: 1,
      }),
    ).toEqual({ usedLetters: 0, usedLeaseAnalyses: 0 })
  })

  it("keeps counts when same tier and same period", () => {
    expect(
      letterLeaseCountsForSameStripeSubscription({
        existingPlan: "pro",
        incomingPlan: "pro",
        periodChanged: false,
        usedLetters: 2,
        usedLeaseAnalyses: 1,
      }),
    ).toEqual({ usedLetters: 2, usedLeaseAnalyses: 1 })
  })
})
