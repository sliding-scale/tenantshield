/** Assistant copy that usually means retrieval failed, not a confirmed empty library. */
export function isLikelyRetrievalFailureResponse(text: string): boolean {
  const t = text.toLowerCase();
  if (/something went wrong|temporary issue|try (your question |asking )?again/i.test(t)) {
    return true;
  }
  if (/don't have that data yet/i.test(t)) {
    return true;
  }
  if (/try again later/i.test(t) && /research state laws/i.test(t)) {
    return true;
  }
  return false;
}
