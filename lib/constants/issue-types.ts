/**
 * Shared tenant issue categories for cases, demand letters, and ratings filters.
 */
export const ISSUE_TYPES = [
  {
    value: "Security Deposit",
    subtitle: "Deposit limits, deductions, and return timelines",
    iconKey: "gavel",
  },
  {
    value: "Repairs / Habitability",
    subtitle: "Unsafe conditions, repairs, and habitability",
    iconKey: "wrench",
  },
  {
    value: "Eviction Notice",
    subtitle: "Notices to quit, nonpayment, or lease violations",
    iconKey: "alert-triangle",
  },
  {
    value: "Rent Increase",
    subtitle: "Increases, notices, and allowable limits",
    iconKey: "trending-up",
  },
  {
    value: "Lease Dispute",
    subtitle: "Terms, breaches, and compliance",
    iconKey: "file-text",
  },
  {
    value: "Landlord Harassment",
    subtitle: "Harassment, entry, retaliation, or coercion",
    iconKey: "shield",
  },
  {
    value: "Discrimination",
    subtitle: "Protected-class or unfair treatment",
    iconKey: "scale",
  },
  {
    value: "Other",
    subtitle: "Other tenant–landlord matters",
    iconKey: "circle-help",
  },
] as const

export type IssueTypeValue = (typeof ISSUE_TYPES)[number]["value"]
export type IssueTypeIconKey = (typeof ISSUE_TYPES)[number]["iconKey"]

/** First entry is the default selection in forms */
export const DEFAULT_ISSUE_TYPE = ISSUE_TYPES[0].value satisfies IssueTypeValue

/** Rating page: all properties + each issue type label */
export const RATING_FILTER_TAGS = [
  "All Properties",
  ...ISSUE_TYPES.map((t) => t.value),
] as const

export type RatingFilterTag = (typeof RATING_FILTER_TAGS)[number]
