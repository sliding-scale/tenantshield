import { action } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { letterAnalysisSchema } from "./aiSchema";
import Exa from "exa-js";
import { GoogleGenAI, Type } from "@google/genai";
import type { z } from "zod";

type LetterAnalysis = z.infer<typeof letterAnalysisSchema>;

export const generateTenantLetter = action({
  args: {
    letterType: v.string(),
    state: v.string(),
    fullName: v.string(),
    landlordName: v.string(),
    propertyAddress: v.string(),
    description: v.string(),
    amountAtStake: v.optional(v.string()),
    deadlineDays: v.string(),
    testUserId: v.optional(v.string()),
    testBypassToken: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    letterId: Id<"letters">;
    letterData: LetterAnalysis;
    createdUnderPlan: "free" | "pro" | "power";
  }> => {
    // ye auth check hai with dev bypass
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
    const createdUnderPlan = await ctx.runQuery(
      (internal as any)["users/queries"].getPlanByClerkId,
      { clerkId: userId },
    );

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const exa = new Exa(process.env.EXA_API_KEY!);

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

    // ye letters ki input hain aur query normalize hogi
    const researchQueryConfig = {
      systemInstruction: `You are a legal search-query normalizer for a tenant-rights assistant.
Your only task is to convert the user's letter context into one high-quality legal research query for web search.

Rules:
- Preserve user intent exactly; do not invent facts.
- Keep jurisdiction explicit: include the provided U.S. state and "USA".
- Focus on tenant/landlord housing law terms, statutes, civil code sections, deadlines, notice requirements, remedies, and penalties relevant to the issue.
- Prefer concise legal keywords over conversational text.
- Do not provide legal advice, conclusions, or analysis.
- Return JSON only that matches the schema exactly.`,
      responseMimeType: "application/json",
      temperature: 0,
      responseSchema: {
        type: Type.OBJECT,
        properties: { optimizedQuery: { type: Type.STRING } },
        required: ["optimizedQuery"],
      },
    };
    const researchQueryContents = [
      {
        role: "user" as const,
        parts: [
          {
            text: `Create a legal research query for ${args.letterType} laws in ${args.state} regarding: ${args.description}`,
          },
        ],
      },
    ];
    const researchQueryResponse = await generateWithFallback({
      config: researchQueryConfig,
      contents: researchQueryContents,
    });
    if (!researchQueryResponse.text) {
      throw new Error("Gemini query response empty hai");
    }
    let parsedResearch: { optimizedQuery?: string };
    try {
      parsedResearch = JSON.parse(researchQueryResponse.text) as {
        optimizedQuery?: string;
      };
    } catch {
      throw new Error("Gemini query response JSON format not found");
    }
    const baseOptimizedQuery =
      parsedResearch.optimizedQuery?.trim() ||
      `${args.letterType} tenant rights demand letter law ${args.state} USA ${args.description}`;
    const lowerQuery = baseOptimizedQuery.toLowerCase();
    const hasState = lowerQuery.includes(args.state.toLowerCase());
    const hasUsa = /\busa\b|\bunited states\b/.test(lowerQuery);
    const exaQuery =
      `${baseOptimizedQuery}${hasState ? "" : ` ${args.state}`}${hasUsa ? "" : " USA"}`.trim();

    // ye query ka prompt ka result Exa ko ja raha hai
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
                link: { type: "string" }
              }
            }
          }
        }
      }
    });

    // ye Exa ka grounded data hai aur ab letter generate hoga
    const prompt = `Draft a tenant legal demand letter using only grounded legal references.

Return JSON matching the provided schema exactly.

TENANT LETTER CONTEXT:
- Letter Type: ${args.letterType}
- Jurisdiction: ${args.state}, USA
- Sender Name: ${args.fullName}
- Recipient (Landlord) Name: ${args.landlordName}
- Property Address: ${args.propertyAddress}
- Core Issue: ${args.description}
- Amount at Stake: ${args.amountAtStake ?? "unspecified"}
- Response Deadline: ${args.deadlineDays} days

GROUNDED LEGAL RESEARCH (Exa JSON):
${JSON.stringify(exaResponse)}

OUTPUT REQUIREMENTS:
1) Metadata and header fields must be complete and coherent for a formal letter.
2) Build paragraphs in this order and with these exact paragraph types:
   - introduction
   - statement_of_facts
   - legal_basis
   - demand
   - deadline_warning
   - closing
3) For legal_basis and any legally grounded claims, include statutes_cited entries using article/section identifiers from research.
4) Do not invent statutes, case law, deadlines, agencies, addresses, or facts not present in user input/research.
5) Tone must be professional, firm, and non-abusive.
6) Keep content practical and specific to the tenant's issue and jurisdiction.`;

    const letterConfig = {
      systemInstruction: `You are a legal-drafting assistant for tenant-rights demand letters.
Your job is to draft a structured, professional demand letter grounded in provided legal research.

Hard rules:
- Use only user-provided facts and provided research context.
- Never invent legal citations, statutes, deadlines, or factual details.
- If legal support is weak, use cautious phrasing and avoid overstated claims.
- Maintain clear legal writing style: formal, concise, and actionable.
- Output JSON only and strictly follow the response schema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["metadata", "header", "salutation", "paragraphs", "signOff"],
        properties: {
          metadata: {
            type: Type.OBJECT,
            required: ["letterTitle", "recipientName", "senderName", "state"],
            properties: {
              letterTitle: { type: Type.STRING },
              recipientName: { type: Type.STRING },
              senderName: { type: Type.STRING },
              state: { type: Type.STRING },
            },
          },
          header: {
            type: Type.OBJECT,
            required: ["senderAddress", "landlordAddress", "date", "subjectLine"],
            properties: {
              senderAddress: { type: Type.STRING },
              landlordAddress: { type: Type.STRING },
              date: { type: Type.STRING },
              subjectLine: { type: Type.STRING },
            },
          },
          salutation: { type: Type.STRING },
          paragraphs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["type", "content"],
              properties: {
                type: { type: Type.STRING },
                content: { type: Type.STRING },
                statutes_cited: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
          signOff: { type: Type.STRING },
        },
      },
    };
    const letterResponse = await generateWithFallback({
      config: letterConfig,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    if (!letterResponse.text) {
      throw new Error("Gemini letter response empty hai");
    }
    let parsedLetter: unknown;
    try {
      parsedLetter = JSON.parse(letterResponse.text);
    } catch {
      throw new Error("Gemini letter response JSON format mein nahi aaya");
    }
    const generatedData = letterAnalysisSchema.parse(parsedLetter);

    // ye letter ka final text hai jo embed hoga
    const fullText = [
      generatedData.header.date,
      generatedData.header.senderAddress,
      generatedData.header.landlordAddress,
      generatedData.header.subjectLine,
      generatedData.salutation,
      ...generatedData.paragraphs.map(p => p.content),
      generatedData.signOff
    ].join("\n\n");

    const embedResult = await ai.models.embedContent({
      model: "gemini-embedding-001",
      config: {
        outputDimensionality: 768,
      },
      contents: fullText,
    });
    const embedding = embedResult.embeddings?.[0]?.values;
    if (!embedding) {
      throw new Error("Gemini embedding empty hai");
    }

    // ye letter DB mein save ho raha hai
    const inputData = {
      letterType: args.letterType,
      state: args.state,
      fullName: args.fullName,
      landlordName: args.landlordName,
      propertyAddress: args.propertyAddress,
      description: args.description,
      amountAtStake: args.amountAtStake,
      deadlineDays: args.deadlineDays,
    };

    const letterId: Id<"letters"> = (await ctx.runMutation(
      (internal as any)["letters/mutations"].saveLetterToDB,
      {
        userId,
        createdUnderPlan,
        inputData,
        letterData: generatedData,
        fullLetterText: fullText,
        embedding,
      },
    )) as Id<"letters">;

    // ye letter chunks ban rahe hain retrieval ke liye
    const chunkPayloads = [
      {
        chunkType: "full_letter",
        chunkText: fullText,
      },
      {
        chunkType: "subject",
        chunkText: generatedData.header.subjectLine,
      },
      {
        chunkType: "legal_basis",
        chunkText: generatedData.paragraphs
          .filter((p) => p.type === "legal_basis")
          .map((p) => p.content)
          .join("\n"),
      },
      {
        chunkType: "demand",
        chunkText: generatedData.paragraphs
          .filter((p) => p.type === "demand")
          .map((p) => p.content)
          .join("\n"),
      },
      {
        chunkType: "deadline_warning",
        chunkText: generatedData.paragraphs
          .filter((p) => p.type === "deadline_warning")
          .map((p) => p.content)
          .join("\n"),
      },
      {
        chunkType: "all_paragraphs",
        chunkText: generatedData.paragraphs.map((p) => p.content).join("\n"),
      },
    ];

    const chunkEmbeddings: Array<{
      chunkType: string;
      chunkText: string;
      embedding: number[];
    }> = [];

    for (const chunk of chunkPayloads) {
      if (!chunk.chunkText.trim()) continue;
      const chunkEmbedResult = await ai.models.embedContent({
        model: "gemini-embedding-001",
        config: {
          outputDimensionality: 768,
        },
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

    await ctx.runMutation(
      (internal as any)["letters/mutations"].saveLetterEmbeddingsToDB,
      {
        letterId,
        userId,
        chunks: chunkEmbeddings,
      },
    );

    return { letterId, letterData: generatedData, createdUnderPlan };
  },
});