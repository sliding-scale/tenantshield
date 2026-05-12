import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Exa from "exa-js";

/**
 * Convex-backed tools for the chat agent. The client must call
 * `convex.setAuth(jwt)` before invoking so actions use `ctx.auth`.
 */
export function createTenantChatTools(convex: ConvexHttpClient) {
  const searchCasesTool = tool(
    async ({ query }) => {
      try {
        return await convex.action(api.chat.retrievers.searchMyCases, {
          query,
        });
      } catch (error) {
        console.error(error);
        return "Failed to retrieve cases. Inform the user there was a database error.";
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
        return await convex.action(api.chat.retrievers.searchMyLeases, {
          query,
        });
      } catch (error) {
        console.error(error);
        return "Failed to retrieve leases.";
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
        return await convex.action(api.chat.retrievers.searchMyLetters, {
          query,
        });
      } catch (error) {
        console.error(error);
        return "Failed to retrieve letters.";
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
      try {
        const exa = new Exa(process.env.EXA_API_KEY!);

        // Build query — state is optional; if missing the agent should
        // have asked the user in a prior turn (per system prompt instructions).
        const stateClause = state ? ` in ${state}` : "";
        const exaQuery = `tenant rights laws regarding ${issue}${stateClause} usa`;

        const response = await exa.search(exaQuery, {
          numResults: 3,
          contents: { highlights: true },
        });

        return JSON.stringify(response.results);
      } catch (error) {
        console.error(error);
        return "Failed to retrieve state laws from the web.";
      }
    },
    {
      name: "research_state_laws",
      description:
        "Use this to search the web for general state laws and statutes. ONLY use this if the answer cannot be found in the user's lease or cases, OR if the user asks a general legal question. If the user has not mentioned their US state, do NOT guess — ask them first before calling this tool.",
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
            "The US State the user is asking about. Leave empty if the user hasn't specified one yet.",
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
