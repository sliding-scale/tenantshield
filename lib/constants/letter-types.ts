export const LETTER_TYPES = [
  {
    value: "Security Deposit",
    title: "Security Deposit",
    subtitle: "Demand return of withheld deposit",
    icon: "banknote",
  },
  {
    value: "Repair Request",
    title: "Repair Request",
    subtitle: "Formal notice demanding repairs",
    icon: "hammer",
  },
  {
    value: "Habitability Breach",
    title: "Habitability Breach",
    subtitle: "Notice of uninhabitable conditions",
    icon: "house",
  },
  {
    value: "Eviction Response",
    title: "Eviction Response",
    subtitle: "Respond to eviction notice",
    icon: "shield",
  },
  {
    value: "Lease Violation",
    title: "Lease Violation",
    subtitle: "Dispute landlord's claim",
    icon: "file-warning",
  },
] as const

export type LetterTypeValue = (typeof LETTER_TYPES)[number]["value"]
export type LetterTypeIconKey = (typeof LETTER_TYPES)[number]["icon"]
