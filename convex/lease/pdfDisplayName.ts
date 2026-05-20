const STORAGE_ID_FILENAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isLikelyDocumentFilename(name: string): boolean {
  const trimmed = name.trim()
  if (!trimmed) return false
  return !STORAGE_ID_FILENAME.test(trimmed)
}

export function resolveLeasePdfDisplayName(
  storedName?: string | null,
  urlDerivedName?: string | null,
): string | null {
  for (const candidate of [storedName, urlDerivedName]) {
    if (candidate && isLikelyDocumentFilename(candidate)) {
      return candidate.trim()
    }
  }
  return null
}
