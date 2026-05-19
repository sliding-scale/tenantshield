/**
 * Letter/lease counters when Stripe sends an update for the same subscription id
 * (billing period rollover and/or tier change via Customer Portal).
 */
export function letterLeaseCountsForSameStripeSubscription(args: {
  existingPlan: string
  incomingPlan: string
  periodChanged: boolean
  usedLetters: number
  usedLeaseAnalyses: number
}): { usedLetters: number; usedLeaseAnalyses: number } {
  const tierChanged = args.existingPlan !== args.incomingPlan
  if (args.periodChanged || tierChanged) {
    return { usedLetters: 0, usedLeaseAnalyses: 0 }
  }
  return {
    usedLetters: args.usedLetters,
    usedLeaseAnalyses: args.usedLeaseAnalyses,
  }
}
