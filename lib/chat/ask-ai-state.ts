import { normalizeUserStateAbbr, type USStateAbbr } from "@/lib/constants/us-states";

/** Used when Ask AI has no saved or profile state. */
export const ASK_AI_DEFAULT_STATE_CODE: USStateAbbr = "FL";

const ASK_AI_STATE_STORAGE_KEY = "tenantshield:ask-ai-state";

/** State sent to /api/chat and tools. */
export function resolveAskAiStateForApi(
  selectedStateCode: string | null | undefined,
): USStateAbbr {
  return normalizeUserStateAbbr(selectedStateCode) || ASK_AI_DEFAULT_STATE_CODE;
}

export function readAskAiStoredState(): USStateAbbr | null {
  if (typeof window === "undefined") return null;
  try {
    const abbr = normalizeUserStateAbbr(
      localStorage.getItem(ASK_AI_STATE_STORAGE_KEY),
    );
    return abbr || null;
  } catch {
    return null;
  }
}

export function writeAskAiStoredState(stateCode: string): void {
  const normalized = normalizeUserStateAbbr(stateCode);
  if (!normalized) return;
  try {
    localStorage.setItem(ASK_AI_STATE_STORAGE_KEY, normalized);
  } catch {
    // ignore quota / private mode
  }
}