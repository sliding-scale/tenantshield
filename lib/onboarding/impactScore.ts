/**
 * Onboarding impact score — weighted 0–100 from six dimensions.
 *
 * DB expectation: `onboardingQuestions` has exactly six **active** rows with
 * `step` 1–6 in this order (option1 → option4 = low → high severity):
 * 1 Time pressure, 2 Financial, 3 Mental load, 4 Life impact, 5 Risk, 6 Willingness to pay.
 */

export type OnboardingImpactOptionKey = "option1" | "option2" | "option3" | "option4"

export type ImpactLabel =
  | "Low impact"
  | "Moderate impact"
  | "Significant impact"
  | "Critical situation"

/** Steps 1–6: time, money, mental, life, risk, willingness (weights sum to 1). */
export const IMPACT_DIMENSIONS: Record<
  number,
  { id: string; weight: number; scores: Record<OnboardingImpactOptionKey, number> }
> = {
  1: {
    id: "time",
    weight: 0.15,
    scores: { option1: 10, option2: 30, option3: 60, option4: 90 },
  },
  2: {
    id: "money",
    weight: 0.25,
    scores: { option1: 10, option2: 40, option3: 70, option4: 100 },
  },
  3: {
    id: "mental",
    weight: 0.15,
    scores: { option1: 10, option2: 40, option3: 70, option4: 100 },
  },
  4: {
    id: "life",
    weight: 0.2,
    scores: { option1: 10, option2: 40, option3: 75, option4: 100 },
  },
  5: {
    id: "risk",
    weight: 0.15,
    scores: { option1: 10, option2: 50, option3: 75, option4: 100 },
  },
  6: {
    id: "willingness",
    weight: 0.1,
    scores: { option1: 10, option2: 30, option3: 60, option4: 100 },
  },
}

/** Active onboarding rows must use these `step` values (1–6), in order. */
export const IMPACT_STEPS = [1, 2, 3, 4, 5, 6] as const

export function labelFor(rawScore: number): ImpactLabel {
  if (rawScore < 30) return "Low impact"
  if (rawScore < 55) return "Moderate impact"
  if (rawScore < 75) return "Significant impact"
  return "Critical situation"
}

export type ImpactScoreInput = { step: number; selectedOption: OnboardingImpactOptionKey }

/**
 * Weighted sum of per-dimension scores (each 0–100), rounded.
 * Throws if any step 1–6 is missing or unknown.
 */
export function computeImpactScore(responses: ImpactScoreInput[]): {
  score: number
  label: ImpactLabel
} {
  const byStep = new Map<number, OnboardingImpactOptionKey>()
  for (const row of responses) {
    byStep.set(row.step, row.selectedOption)
  }

  let weighted = 0
  for (const step of IMPACT_STEPS) {
    const dim = IMPACT_DIMENSIONS[step]
    if (!dim) {
      throw new Error(`Unknown impact step: ${step}`)
    }
    const selected = byStep.get(step)
    if (!selected) {
      throw new Error(`Missing response for onboarding step ${step}`)
    }
    const value = dim.scores[selected]
    if (value === undefined) {
      throw new Error(`Invalid option "${selected}" for step ${step}`)
    }
    weighted += value * dim.weight
  }

  const score = Math.round(weighted)
  return { score, label: labelFor(score) }
}
