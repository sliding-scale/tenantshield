import { action } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { leaseAnalysisSchema } from "./aiSchema";
import type { z } from "zod";
import Exa from "exa-js";
import { GoogleGenAI, Type } from "@google/genai";

type LeaseAnalysis = z.infer<typeof leaseAnalysisSchema>;

interface AnalysisCoreResult {
  generatedData: LeaseAnalysis;
  embedding: number[];
  chunkEmbeddings: Array<{
    chunkType: string;
    chunkText: string;
    embedding: number[];
  }>;
}

async function runLeaseAnalysisCore(
  state: string,
  leaseText: string,
): Promise<AnalysisCoreResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  const exa = new Exa(process.env.EXA_API_KEY as string);

  const generateWithFallback = async (params: {
    config: object;
    contents: Array<{ role: "user"; parts: Array<{ text: string }> }>;
  }) => {
    const models = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.5-pro"];
    const maxRetries = 2;
    let lastError: unknown;

    for (const model of models) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await ai.models.generateContent({
            model,
            config: params.config,
            contents: params.contents,
          });
        } catch (error) {
          lastError = error;
          const message = error instanceof Error ? error.message : String(error);
          const isTransient =
            /UNAVAILABLE|503|high demand|RESOURCE_EXHAUSTED/i.test(message);
          const canRetry = isTransient && attempt < maxRetries;
          if (canRetry) {
            await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
            continue;
          }
          break;
        }
      }
    }
    throw lastError;
  };

  const researchQueryConfig = {
    systemInstruction: `You are a legal search-query normalizer for a lease-review assistant.
Your only task is to generate one high-precision legal research query from the lease content.

Rules:
- Preserve the lease context exactly; do not invent terms.
- Include the provided U.S. state and "USA" explicitly.
- Focus on tenant/landlord statutes and regulations related to: rent, late fees, security deposit handling, repairs, notice of entry, lease termination, and eviction.
- Prefer statute-oriented legal keywords over conversational language.
- Return JSON only that matches the schema exactly.`,
    responseMimeType: "application/json",
    temperature: 0,
    responseSchema: {
      type: Type.OBJECT,
      properties: { optimizedQuery: { type: Type.STRING } },
      required: ["optimizedQuery"],
    },
  };

  const researchQueryResponse = await generateWithFallback({
    config: researchQueryConfig,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Generate one legal web-research query for lease review.

State: ${state}
Lease text:
${leaseText}`,
          },
        ],
      },
    ],
  });

  if (!researchQueryResponse.text) {
    throw new Error("Gemini lease-query response was empty.");
  }

  let parsedResearch: { optimizedQuery?: string };
  try {
    parsedResearch = JSON.parse(researchQueryResponse.text) as {
      optimizedQuery?: string;
    };
  } catch {
    throw new Error("Gemini lease-query response was not valid JSON.");
  }

  const baseOptimizedQuery =
    parsedResearch.optimizedQuery?.trim() ||
    `tenant lease law review  ${state} USA`;
  const lowerQuery = baseOptimizedQuery.toLowerCase();
  const hasState = lowerQuery.includes(state.toLowerCase());
  const hasUsa = /\busa\b|\bunited states\b/.test(lowerQuery);
  const exaQuery =
    `${baseOptimizedQuery}${hasState ? "" : ` ${state}`}${hasUsa ? "" : " USA"}`.trim();

  const exaResponse = await exa.search(exaQuery, {
    numResults: 5,
    outputSchema: {
      type: "object",
      required: ["laws"],
      properties: {
        laws: {
          type: "array",
          items: {
            type: "object",
            required: ["title", "article_number", "description"],
            properties: {
              title: { type: "string" },
              article_number: { type: "string" },
              description: { type: "string" },
              link: { type: "string" },
            },
          },
        },
      },
    },
    stream: false,
    type: "auto",
    userLocation: "US",
    contents: {
      highlights: true,
    },
  });

  const analysisPrompt = `Review this lease against the provided legal research and return strict JSON.

STATE: ${state}

LEASE TEXT:
${leaseText}

GROUNDED LEGAL RESEARCH (Exa JSON):
${JSON.stringify(exaResponse)}

Output requirements:
1) "leaseReview": short label (for example, "California Residential Lease Review").
2) "documentSummary": objective summary of key terms.
3) "redFlags": quote exact lease snippets and explain legal risk grounded in the provided research.
4) "missingClauses": identify missing protections/disclosures typically expected under state landlord-tenant law.
5) "tenantFriendlyClauses": quote exact favorable snippets and explain benefit.
6) "questionsToAsk": practical, specific follow-up questions before signing.
7) "overallRecommendation": must start with one verdict in caps: NEGOTIATE, DO NOT SIGN, or GOOD TO SIGN, followed by concise reasoning.

Never invent statutes, deadlines, agencies, legal remedies, or lease facts.`;

  const leaseConfig = {
    systemInstruction: `You are a tenant-rights lease analysis assistant for Tenant Shield.
Your job is to produce a practical legal risk review grounded only in the provided lease text and research JSON.

Hard rules:
- Use only user-provided lease text and provided Exa research.
- Never fabricate statutes, section numbers, deadlines, agencies, penalties, addresses, or legal claims.
- When citing legal support in explanations, rely only on statute references that appear in the research JSON.
- For red flags and tenant-friendly clauses, use direct quotes from the lease text.
- If legal support is weak or ambiguous, state uncertainty clearly and recommend local verification.
- Keep tone professional, plain-language, and actionable.
- Return JSON only, matching schema exactly.`,
    responseMimeType: "application/json",
    temperature: 0,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        leaseReview: { type: Type.STRING },
        documentSummary: { type: Type.STRING },
        redFlags: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["quote", "problem"],
            properties: {
              quote: { type: Type.STRING },
              problem: { type: Type.STRING },
            },
          },
        },
        missingClauses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["clauseName", "explanation"],
            properties: {
              clauseName: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
          },
        },
        tenantFriendlyClauses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["quote", "explanation"],
            properties: {
              quote: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
          },
        },
        questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
        overallRecommendation: { type: Type.STRING },
      },
      required: [
        "leaseReview",
        "documentSummary",
        "redFlags",
        "missingClauses",
        "tenantFriendlyClauses",
        "questionsToAsk",
        "overallRecommendation",
      ],
    },
  };

  const leaseResponse = await generateWithFallback({
    config: leaseConfig,
    contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
  });

  if (!leaseResponse.text) {
    throw new Error("Gemini lease analysis response was empty.");
  }

  let parsedLease: unknown;
  try {
    parsedLease = JSON.parse(leaseResponse.text);
  } catch {
    throw new Error("Gemini lease analysis response was not valid JSON.");
  }

  const generatedData = leaseAnalysisSchema.parse(parsedLease);

  const textToEmbed = [
    `LEASE REVIEW: ${generatedData.leaseReview} (${state})`,
    `SUMMARY: ${generatedData.documentSummary}`,
    `RED FLAGS: ${generatedData.redFlags.map((rf) => rf.problem).join(" ")}`,
    `MISSING CLAUSES: ${generatedData.missingClauses.map((mc) => mc.explanation).join(" ")}`,
    `TENANT FRIENDLY: ${generatedData.tenantFriendlyClauses.map((tf) => tf.explanation).join(" ")}`,
    `QUESTIONS: ${generatedData.questionsToAsk.join(" ")}`,
    `RECOMMENDATION: ${generatedData.overallRecommendation}`,
  ].join("\n\n");

  const embedResult = await ai.models.embedContent({
    model: "gemini-embedding-001",
    config: { outputDimensionality: 768 },
    contents: textToEmbed,
  });
  const embedding = embedResult.embeddings?.[0]?.values;
  if (!embedding) {
    throw new Error("Gemini embedding was empty.");
  }

  const chunkPayloads = [
    { chunkType: "full_lease_review", chunkText: textToEmbed },
    { chunkType: "document_summary", chunkText: generatedData.documentSummary },
    {
      chunkType: "red_flags",
      chunkText: generatedData.redFlags
        .map((rf, i) => `${i + 1}. Quote: ${rf.quote}\nProblem: ${rf.problem}`)
        .join("\n\n"),
    },
    {
      chunkType: "missing_clauses",
      chunkText: generatedData.missingClauses
        .map((mc, i) => `${i + 1}. Clause: ${mc.clauseName}\nExplanation: ${mc.explanation}`)
        .join("\n\n"),
    },
    {
      chunkType: "tenant_friendly_clauses",
      chunkText: generatedData.tenantFriendlyClauses
        .map((tf, i) => `${i + 1}. Quote: ${tf.quote}\nExplanation: ${tf.explanation}`)
        .join("\n\n"),
    },
    { chunkType: "questions_to_ask", chunkText: generatedData.questionsToAsk.join("\n") },
    { chunkType: "overall_recommendation", chunkText: generatedData.overallRecommendation },
  ];

  const chunkEmbeddings: AnalysisCoreResult["chunkEmbeddings"] = [];
  for (const chunk of chunkPayloads) {
    if (!chunk.chunkText.trim()) continue;
    const chunkEmbedResult = await ai.models.embedContent({
      model: "gemini-embedding-001",
      config: { outputDimensionality: 768 },
      contents: chunk.chunkText,
    });
    const vector = chunkEmbedResult.embeddings?.[0]?.values;
    if (!vector) continue;
    chunkEmbeddings.push({
      chunkType: chunk.chunkType,
      chunkText: chunk.chunkText,
      embedding: vector,
    });
  }

  return { generatedData, embedding, chunkEmbeddings };
}

// One-shot action: accepts raw text, runs full pipeline, inserts a complete lease row.
// Kept for tests and any non-upload flows.
export const analyzeLeaseDocument = action({
  args: {
    state: v.string(),
    leaseText: v.string(),
    testUserId: v.optional(v.string()),
    testBypassToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const expectedBypassToken = process.env.TEST_BYPASS_TOKEN;
    const canUseTestBypass =
      Boolean(expectedBypassToken) &&
      args.testBypassToken === expectedBypassToken &&
      Boolean(args.testUserId);
    const userId = identity?.subject ?? (canUseTestBypass ? args.testUserId : undefined);
    if (!userId) {
      throw new Error(
        "Missing user identity. Log in or provide a valid test bypass token in dev.",
      );
    }

    const { generatedData, embedding, chunkEmbeddings } =
      await runLeaseAnalysisCore(args.state, args.leaseText);

    const leaseId: Id<"leases"> = (await ctx.runMutation(
      (internal as any)["lease/mutations"].saveLeaseToDB,
      {
        userId,
        state: args.state,
        leaseText: args.leaseText,
        aiAnalysis: generatedData,
        embedding,
      },
    )) as Id<"leases">;

    await ctx.runMutation(
      (internal as any)["lease/mutations"].saveLeaseEmbeddingsToDB,
      { leaseId, userId, chunks: chunkEmbeddings },
    );

    return { leaseId, leaseData: generatedData };
  },
});

// Two-phase action: called with a draft leaseId, reads text from DB, runs analysis, patches the row.
export const analyzeLeaseById = action({
  args: {
    leaseId: v.id("leases"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const lease = await ctx.runQuery(
      (internal as any)["lease/queries"].getLeaseById,
      { leaseId: args.leaseId },
    );
    if (!lease) throw new Error("Lease not found");
    if (lease.userId !== userId) throw new Error("Not authorized");

    const { generatedData, embedding, chunkEmbeddings } =
      await runLeaseAnalysisCore(lease.state, lease.leaseText);

    await ctx.runMutation(
      (internal as any)["lease/mutations"].patchLeaseAnalysis,
      { leaseId: args.leaseId, aiAnalysis: generatedData, embedding },
    );

    await ctx.runMutation(
      (internal as any)["lease/mutations"].saveLeaseEmbeddingsToDB,
      { leaseId: args.leaseId, userId, chunks: chunkEmbeddings },
    );

    return { leaseId: args.leaseId, leaseData: generatedData };
  },
});
