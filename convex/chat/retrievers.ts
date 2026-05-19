import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { GoogleGenAI } from "@google/genai";
import { isTransientError, withRetries } from "../../lib/chat/retry";

// Shared helper: generate an embedding vector for a search query
async function embedQuery(query: string): Promise<number[]> {
  return withRetries(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
    const embedResult = await ai.models.embedContent({
      model: "gemini-embedding-001",
      config: { outputDimensionality: 768 },
      contents: query,
    });
    const vector = embedResult.embeddings?.[0]?.values;
    if (!vector) throw new Error("Failed to generate embedding");
    return vector;
  });
}

async function vectorSearchWithRetry<T extends string>(
  search: () => Promise<Array<{ _id: T }>>,
): Promise<Array<{ _id: T }>> {
  try {
    return await withRetries(search);
  } catch (error) {
    if (isTransientError(error)) {
      throw new Error(
        `[RETRIEVAL_ERROR] Vector search failed after retries: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    throw error;
  }
}

// ==============================================
// RETRIEVER 1: Search Cases (caseEmbeddings — chunks)
// ==============================================
export const searchMyCases = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;

    const vector = await embedQuery(args.query);

    const results = await vectorSearchWithRetry(() =>
      ctx.vectorSearch("caseEmbeddings", "by_user_case_chunk_embedding", {
        vector,
        limit: 5,
        filter: (q) => q.eq("userId", userId),
      }),
    );

    const chunkIds = results.map((r) => r._id);
    if (chunkIds.length === 0)
      return "[NO_DATA] No relevant case documents found for this user. The user has not submitted cases yet — suggest the 'New Case' feature.";

    const chunks: string[] = await ctx.runQuery(internal.chat.queries.getCaseChunks, { ids: chunkIds });
    return chunks.join("\n\n---\n\n");
  },
});

// ==============================================
// RETRIEVER 2: Search Leases (leaseEmbeddings — chunks)
// ==============================================
export const searchMyLeases = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;

    const vector = await embedQuery(args.query);

    const results = await vectorSearchWithRetry(() =>
      ctx.vectorSearch("leaseEmbeddings", "by_user_lease_chunk_embedding", {
        vector,
        limit: 5,
        filter: (q) => q.eq("userId", userId),
      }),
    );

    const chunkIds = results.map((r) => r._id);
    if (chunkIds.length === 0)
      return "[NO_DATA] No lease documents or embeddings found for this user. The user has not uploaded a lease yet — suggest the 'Analyze Lease' feature.";

    const chunks: string[] = await ctx.runQuery(internal.chat.queries.getLeaseChunks, { ids: chunkIds });
    return chunks.join("\n\n---\n\n");
  },
});

// ==============================================
// RETRIEVER 3: Search Letters (letterEmbeddings — chunks)
// ==============================================
export const searchMyLetters = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;

    const vector = await embedQuery(args.query);

    const results = await vectorSearchWithRetry(() =>
      ctx.vectorSearch("letterEmbeddings", "by_user_letter_chunk_embedding", {
        vector,
        limit: 5,
        filter: (q) => q.eq("userId", userId),
      }),
    );

    const chunkIds = results.map((r) => r._id);
    if (chunkIds.length === 0)
      return "[NO_DATA] No relevant letters found for this user. The user has not drafted letters yet — suggest the 'Write Letter' feature.";

    const chunks: string[] = await ctx.runQuery(internal.chat.queries.getLetterChunks, { ids: chunkIds });
    return chunks.join("\n\n---\n\n");
  },
});