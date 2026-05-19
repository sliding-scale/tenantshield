import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Exa from "exa-js";
import { US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states";
import { ASK_AI_DEFAULT_STATE_CODE } from "@/lib/chat/ask-ai-state";
import {
  isRetrievalFailureResult,
  withRetries,
  withRetriesOnResult,
} from "@/lib/chat/retry";

const RETRIEVAL_ERROR =
  "[RETRIEVAL_ERROR] Could not load data after several attempts. Tell the user to tap Retry or ask again in a moment — do NOT say you don't have their data.";

function resolveStateLabel(
  stateArg: string | undefined,
  selectedStateCode: string | null | undefined,
): string | undefined {
  const code = (
    stateArg?.trim() ||
    selectedStateCode?.trim() ||
    ASK_AI_DEFAULT_STATE_CODE
  ).toUpperCase();
  if (!code) return undefined;
  const name = US_STATE_NAMES[code as USStateAbbr];
  return name ? `${name} (${code})` : code;
}

function shouldRetryConvexResult(result: string): boolean {
  return isRetrievalFailureResult(result);
}

function shouldRetryExaResult(result: string): boolean {
  if (isRetrievalFailureResult(result)) return true;
  try {
    const parsed = JSON.parse(result) as unknown;
    return Array.isArray(parsed) && parsed.length === 0;
  } catch {
    return false;
  }
}

/**
 * Convex-backed tools for the chat agent. The client must call
 * `convex.setAuth(jwt)` before invoking so actions use `ctx.auth`.
 */
export function createTenantChatTools(
  convex: ConvexHttpClient,
  options?: { selectedStateCode?: string | null },
) {
  const selectedStateCode = options?.selectedStateCode ?? null;

  const searchCasesTool = tool(
    async ({ query }) => {
      try {
        return await withRetriesOnResult(
          () =>
            convex.action(api.chat.retrievers.searchMyCases, {
              query,
            }),
          shouldRetryConvexResult,
        );
      } catch (error) {
        console.error("[search_my_cases]", error);
        return RETRIEVAL_ERROR;
      }
    },
    {
      name: "search_my_cases",
      description:
        "CRITICAL: Use this to search the user's previously analyzed legal cases, disputes, and incident descriptions. Always use this if the user asks about their past tenant issues or case strength.",
      schema: z.object({
        query: z
          .string()
          .describe(
            "A highly optimized semantic search query based on the user's question.",
          ),
      }),
    },
  );

  const searchLeasesTool = tool(
    async ({ query }) => {
      try {
        return await withRetriesOnResult(
          () =>
            convex.action(api.chat.retrievers.searchMyLeases, {
              query,
            }),
          shouldRetryConvexResult,
        );
      } catch (error) {
        console.error("[search_my_leases]", error);
        return RETRIEVAL_ERROR;
      }
    },
    {
      name: "search_my_leases",
      description:
        "CRITICAL: Use this to search the user's uploaded lease agreements for specific clauses, red flags, or rules. Use this FIRST if the user asks 'Does my lease say...' or 'Am I allowed to...'",
      schema: z.object({
        query: z
          .string()
          .describe(
            "The search query representing the lease clause or rule the user is looking for.",
          ),
      }),
    },
  );

  const searchLettersTool = tool(
    async ({ query }) => {
      try {
        return await withRetriesOnResult(
          () =>
            convex.action(api.chat.retrievers.searchMyLetters, {
              query,
            }),
          shouldRetryConvexResult,
        );
      } catch (error) {
        console.error("[search_my_letters]", error);
        return RETRIEVAL_ERROR;
      }
    },
    {
      name: "search_my_letters",
      description:
        "Use this to search demand letters the user has previously drafted or sent to their landlord.",
      schema: z.object({
        query: z
          .string()
          .describe("The subject or content of the letter to search for."),
      }),
    },
  );

  const researchLawsTool = tool(
    async ({ issue, state }) => {
      const apiKey = process.env.EXA_API_KEY;
      if (!apiKey) {
        return "[RETRIEVAL_ERROR] Web research is not configured on the server.";
      }

      const stateLabel = resolveStateLabel(state, selectedStateCode);
      const stateClause = stateLabel ? ` in ${stateLabel}` : "";
      const exaQuery = `tenant rights laws regarding ${issue}${stateClause} usa`;

      console.log("[research_state_laws] query:", exaQuery);
      const maxAttempts = 3;
      let lastError: unknown;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const exa = new Exa(apiKey);
          const response = await exa.search(exaQuery, {
            numResults: 5,
            contents: { highlights: true },
          });
          const results = response.results;
          if (results && results.length > 0) {
            return JSON.stringify(results);
          }
          // Empty results — retry with a broader query on next attempt
          if (attempt < maxAttempts - 1) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
          return `[NO_DATA] No relevant state law results found for "${issue}" in ${stateLabel || "the US"}. The user can try the "Research State Laws" page for pre-generated state law summaries.`;
        } catch (error) {
          lastError = error;
          console.error(`[research_state_laws] attempt ${attempt + 1}/${maxAttempts}:`, error);
          if (attempt < maxAttempts - 1) {
            await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
          }
        }
      }

      console.error("[research_state_laws] all attempts failed:", lastError);
      return RETRIEVAL_ERROR;
    },
    {
      name: "research_state_laws",
      description:
        "Use this to search the web for general state laws and statutes. ONLY use this if the answer cannot be found in the user's lease or cases, OR if the user asks a general legal question. Always pass the user's US state when known.",
      schema: z.object({
        issue: z
          .string()
          .describe(
            "The specific legal issue (e.g., 'security deposit return timeline').",
          ),
        state: z
          .string()
          .optional()
          .describe(
            "The US state code (e.g. CA, NY). Use the state already selected in the app when available.",
          ),
      }),
    },
  );

  return [
    searchCasesTool,
    searchLeasesTool,
    searchLettersTool,
    researchLawsTool,
  ];
}
