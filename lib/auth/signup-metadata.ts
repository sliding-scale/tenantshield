export function signupMetadataFromType(type: string | null) {
  if (!type) return undefined
  if (type === "admin") return { role: "admin" as const }
  if (type === "tenant" || type === "customer" || type === "cleaner") {
    return { role: "tenant" as const }
  }
  return { role: type }
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const t = fullName.trim()
  if (!t) return { firstName: "", lastName: "" }
  const i = t.indexOf(" ")
  if (i === -1) return { firstName: t, lastName: t }
  return { firstName: t.slice(0, i), lastName: t.slice(i + 1).trim() || t.slice(0, i) }
}
