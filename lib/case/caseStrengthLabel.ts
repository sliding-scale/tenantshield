/** Display label for donut / hero (uppercase in UI). */
export function caseStrengthLabel(score: number): string {
  if (score < 20) return "Weak"
  if (score < 40) return "Low"
  if (score < 60) return "Moderate"
  if (score < 80) return "Strong"
  return "Very strong"
}
