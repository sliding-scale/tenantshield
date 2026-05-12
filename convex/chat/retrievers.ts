import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { GoogleGenAI } from "@google/genai";

// Shared helper: generate an embedding vector for a search query
async function embedQuery(query: string): Promise<number[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  const embedResult = await ai.models.embedContent({
    model: "gemini-embedding-001",
    config: { outputDimensionality: 768 },
    contents: query,
  });
  const vector = embedResult.embeddings?.[0]?.values;
  if (!vector) throw new Error("Failed to generate embedding");
  return vector;
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

    const results = await ctx.vectorSearch(
      "caseEmbeddings",
      "by_user_case_chunk_embedding",
      {
        vector,
        limit: 3,
        filter: (q) => q.eq("userId", userId),
      },
    );

    const chunkIds = results.map((r) => r._id);
    if (chunkIds.length === 0)
      return "No relevant case documents found for this user. Ask the user to submit a case first through the 'New Case' feature so you can analyze it.";

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

    const results = await ctx.vectorSearch("leaseEmbeddings", "by_user_lease_chunk_embedding", {
      vector,
      limit: 3,
      filter: (q) => q.eq("userId", userId),
    });

    const chunkIds = results.map((r) => r._id);
    if (chunkIds.length === 0)
      return "No lease documents or embeddings found for this user. Let the user know you don't have their lease information yet and ask them to upload their lease through the 'Analyze Lease' feature.";

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

    const results = await ctx.vectorSearch("letterEmbeddings", "by_user_letter_chunk_embedding", {
      vector,
      limit: 3,
      filter: (q) => q.eq("userId", userId),
    });

    const chunkIds = results.map((r) => r._id);
    if (chunkIds.length === 0)
      return "No relevant letters found for this user. Let the user know you don't have any of their letters yet and ask them to draft one through the 'Write Letter' feature.";

    const chunks: string[] = await ctx.runQuery(internal.chat.queries.getLetterChunks, { ids: chunkIds });
    return chunks.join("\n\n---\n\n");
  },
});