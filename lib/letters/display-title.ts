function trimTrailingSeparators(value: string): string {
  return value.replace(/[\s,\-–—:]+$/g, "").trim()
}

function stripKnownPropertyAddress(title: string, propertyAddress?: string): string {
  const address = propertyAddress?.trim()
  if (!address) return title

  let result = title.trim()
  const escaped = address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  const patterns = [
    new RegExp(`\\s+at\\s+${escaped}\\s*$`, "i"),
    new RegExp(`\\s+-\\s+${escaped}\\s*$`, "i"),
    new RegExp(`\\s*,\\s*${escaped}\\s*$`, "i"),
    new RegExp(`\\s+regarding\\s+${escaped}\\s*$`, "i"),
    new RegExp(`\\s+for\\s+(?:the\\s+)?property\\s+(?:at\\s+)?${escaped}\\s*$`, "i"),
    new RegExp(`\\s+property\\s+address\\s*:\\s*${escaped}\\s*$`, "i"),
    new RegExp(`\\s+${escaped}\\s*$`, "i"),
  ]

  for (const pattern of patterns) {
    const next = result.replace(pattern, "").trim()
    if (next !== result) {
      result = trimTrailingSeparators(next)
      break
    }
  }

  return result
}

/** Display title without trailing property-address clauses from AI subject lines. */
export function stripAddressFromLetterTitle(
  title: string,
  propertyAddress?: string,
): string {
  let trimmed = title.trim()
  if (!trimmed) return trimmed

  const genericPatterns = [
    /\s+at\s+property\s+address\s*:\s*.+$/i,
    /\s+property\s+address\s*:\s*.+$/i,
    /\s+at\s+the\s+property\s+(?:located\s+)?at\s+.+$/i,
    /\s+regarding\s+(?:the\s+)?property\s+(?:located\s+)?at\s+.+$/i,
    /\s+(?:at|for)\s+\d[\w\s,.#-]{5,}$/i,
    /\s+-\s+\d[\w\s,.#-]{5,}$/i,
  ]

  for (const pattern of genericPatterns) {
    const stripped = trimmed.replace(pattern, "").trim()
    if (stripped !== trimmed) {
      trimmed = trimTrailingSeparators(stripped)
      break
    }
  }

  return stripKnownPropertyAddress(trimmed, propertyAddress)
}

export function letterDisplayTitle(
  subjectLine: string | undefined,
  fallback = "Demand Letter",
  propertyAddress?: string,
): string {
  const raw = subjectLine?.trim() || fallback
  return stripAddressFromLetterTitle(raw, propertyAddress) || fallback
}
