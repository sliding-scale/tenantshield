/**
 * Shared tenant issue categories for cases, demand letters, and ratings filters.
 */
export const ISSUE_TYPES = [
  {
    value: "Security Deposit",
    subtitle: "Deposits & return timelines",
    iconKey: "gavel",
  },
  {
    value: "Repairs / Habitability",
    subtitle: "Repairs & habitability",
    iconKey: "wrench",
  },
  {
    value: "Eviction Notice",
    subtitle: "Quit notices & violations",
    iconKey: "alert-triangle",
  },
  {
    value: "Rent Increase",
    subtitle: "Increases & legal limits",
    iconKey: "trending-up",
  },
  {
    value: "Lease Dispute",
    subtitle: "Terms & lease breaches",
    iconKey: "file-text",
  },
  {
    value: "Landlord Harassment",
    subtitle: "Harassment & retaliation",
    iconKey: "shield",
  },
  {
    value: "Discrimination",
    subtitle: "Protected-class bias",
    iconKey: "scale",
  },
  {
    value: "Other",
    subtitle: "Other tenant matters",
    iconKey: "circle-help",
  },
] as const

export type IssueTypeValue = (typeof ISSUE_TYPES)[number]["value"]
export type IssueTypeIconKey = (typeof ISSUE_TYPES)[number]["iconKey"]

/** First entry is the default selection in forms */
export const DEFAULT_ISSUE_TYPE = ISSUE_TYPES[0].value satisfies IssueTypeValue

export function isIssueTypeValue(value: string): value is IssueTypeValue {
  return ISSUE_TYPES.some((t) => t.value === value)
}

/** Rating page: all properties + each issue type label */
export const RATING_FILTER_TAGS = [
  "All Properties",
  ...ISSUE_TYPES.map((t) => t.value),
] as const

export type RatingFilterTag = (typeof RATING_FILTER_TAGS)[number]
