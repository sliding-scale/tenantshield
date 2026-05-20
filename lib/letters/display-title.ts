/** Display title without trailing property-address clauses from AI subject lines. */
export function stripAddressFromLetterTitle(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) return trimmed

  const patterns = [
    /\s+at\s+property\s+address\s*:\s*.+$/i,
    /\s+property\s+address\s*:\s*.+$/i,
    /\s+at\s+the\s+property\s+(?:located\s+)?at\s+.+$/i,
    /\s+regarding\s+(?:the\s+)?property\s+(?:located\s+)?at\s+.+$/i,
  ]

  for (const pattern of patterns) {
    const stripped = trimmed.replace(pattern, "").trim()
    if (stripped !== trimmed) return stripped
  }

  return trimmed
}

export function letterDisplayTitle(
  subjectLine: string | undefined,
  fallback = "Demand Letter",
): string {
  const raw = subjectLine?.trim() || fallback
  return stripAddressFromLetterTitle(raw) || fallback
}
