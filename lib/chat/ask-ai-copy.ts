import { US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"

export function askAiStateName(stateCode: string | null): string {
  if (stateCode && stateCode in US_STATE_NAMES) {
    return US_STATE_NAMES[stateCode as USStateAbbr]
  }
  return "your state"
}

export function askAiIntroSubtitle(stateCode: string | null): string {
  const stateName = askAiStateName(stateCode)
  return `Ask me anything about tenant rights in ${stateName} — deposits, rent increases, repairs, evictions, and more.`
}
