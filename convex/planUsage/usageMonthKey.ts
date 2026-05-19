const USAGE_QUOTA_TIMEZONE = "America/New_York"

/** YYYY-MM in America/New_York for letter/lease quota windows (yearly billing). */
export function usageMonthKeyEastern(nowMs: number = Date.now()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: USAGE_QUOTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date(nowMs))

  const year = parts.find((p) => p.type === "year")?.value
  const month = parts.find((p) => p.type === "month")?.value
  if (!year || !month) throw new Error("usageMonthKeyEastern: failed to format date")

  return `${year}-${month}`
}
