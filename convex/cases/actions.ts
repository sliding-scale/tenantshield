import { action } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { caseAnalysisSchema } from "./aiSchema";
import Exa from "exa-js";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import type { z } from "zod";

type CaseAnalysis = z.infer<typeof caseAnalysisSchema>;

export const analyzeNewCase = action({
  args: {
    issueType: v.string(),
    shortTitle: v.string(),
    description: v.string(),
    state: v.string(),
    city: v.optional(v.string()),
    landlordName: v.optional(v.string()),
    propertyAddress: v.optional(v.string()),
    testUserId: v.optional(v.string()),
    testBypassToken: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ caseId: Id<"cases">; aiAnalysis: CaseAnalysis }> => {
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

    const inputData = {
      issueType: args.issueType,
      shortTitle: args.shortTitle,
      description: args.description,
      state: args.state,
      city: args.city,
      landlordName: args.landlordName,
      propertyAddress: args.propertyAddress,
    };

    console.log(`Starting analysis for user: ${userId}, State: ${args.state}`);

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });

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
            const modelConfig =
              model === "gemini-2.5-pro"
                ? Object.fromEntries(
                    Object.entries(params.config).filter(
                      ([key]) => key !== "thinkingConfig",
                    ),
                  )
                : params.config;
            return await ai.models.generateContent({
              model,
              config: modelConfig,
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

    const queryRewriteConfig = {
      systemInstruction: `You are a legal search query normalizer for a tenant-rights app.
Your job is to rewrite user input into a high-quality legal research query and a clearer normalized description.
Never invent facts. Never provide legal conclusions. Preserve user intent and jurisdiction context.`,
      responseMimeType: "application/json",
      temperature: 0,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          optimizedExaQuery: { type: Type.STRING },
          normalizedDescription: { type: Type.STRING },
        },
        required: ["optimizedExaQuery", "normalizedDescription"],
      },
    };
    const queryRewriteContents = [
      {
        role: "user" as const,
        parts: [
          {
            text: `Rewrite this tenant case input for legal search quality.

Return JSON with:
1) optimizedExaQuery: high-quality query for U.S. tenant law research.
2) normalizedDescription: clearer legal restatement of the same user issue.

Rules:
- Keep meaning same.
- Do not invent new facts.
- Include location context when relevant.

Issue Type: ${args.issueType}
Description: ${args.description}
State: ${args.state}
City: ${args.city ?? "N/A"}
Landlord Name: ${args.landlordName ?? "N/A"}
Property Address: ${args.propertyAddress ?? "N/A"}`,
          },
        ],
      },
    ];

    const queryRewriteResponse = await generateWithFallback({
      config: queryRewriteConfig,
      contents: queryRewriteContents,
    });
    const rewriteRaw = queryRewriteResponse.text;
    if (!rewriteRaw) {
      throw new Error("Gemini query rewrite returned empty response");
    }
    const rewriteData = JSON.parse(rewriteRaw) as {
      optimizedExaQuery?: string;
      normalizedDescription?: string;
    };

    const locationStr = args.city ? `${args.city}, ${args.state}` : args.state;
    const normalizedDescription =
      rewriteData.normalizedDescription?.trim() || args.description;
    const baseOptimizedQuery =
      rewriteData.optimizedExaQuery?.trim() ||
      `tenant rights laws regarding ${args.issueType} in ${locationStr}, USA`;
    const lowerQuery = baseOptimizedQuery.toLowerCase();
    const hasState = lowerQuery.includes(args.state.toLowerCase());
    const hasUsa = /\busa\b|\bunited states\b/.test(lowerQuery);
    const exaQuery = `${baseOptimizedQuery}${hasState ? "" : ` ${args.state}`}${hasUsa ? "" : " USA"}`.trim();

    const exa = new Exa(process.env.EXA_API_KEY as string);
    const exaResponse = await exa.search(exaQuery, {
      numResults: 5,
      outputSchema: {
        type: "object",
        required: ["laws"],
        properties: {
          laws: {
            type: "array",
            description: "List of laws with their details and sources",
            items: {
              type: "object",
              required: ["title", "state", "article_number", "link"],
              properties: {
                title: {
                  type: "string",
                  description: "Title or name of the law",
                },
                state: {
                  type: "string",
                  description: "State where the law is from",
                },
                article_number: {
                  type: "string",
                  description: "Article number or section reference",
                },
                link: {
                  type: "string",
                  description: "URL link to the law page",
                },
                description: {
                  type: "string",
                  description: "Brief description of what the law covers",
                },
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

    const structuredLawsJSON = JSON.stringify(exaResponse, null, 2);
    const prompt = `
        You are an expert legal AI assistant for a software called Tenant Shield.
        Analyze the tenant's issue based ONLY on the provided structured legal research.
        Never invent laws, statutes, rights, deadlines, or legal citations.
        For "yourRights", include only rights directly supported by the Exa results.
        If the Exa results do not support a right, write exactly: "Local laws require verification".
        
        USER INPUT:
        Issue: ${args.issueType}
        Description: ${normalizedDescription}
        State: ${args.state}
        
        STRUCTURED LEGAL RESEARCH (JSON from Exa):
        ${structuredLawsJSON}
        
        INSTRUCTIONS:
        1. Calculate a caseStrength score from 0-100 based on how well the user's description aligns with the laws provided.
        2. For 'yourRights', strictly reference the 'title' and 'article_number' from the JSON. DO NOT invent rights.
        3. For 'recommendedActions', provide practical next steps based on the user's specific situation.
        4. For 'redFlags', highlight any immediate dangers or deadlines.
        5. For 'userTimeline', provide a timeline of actions the tenant should take in the next 30 days.
        6. For 'caseStrengthDescription', provide a detailed explanation of the case strength score based on the provided state laws.
        `;

    const config = {
      systemInstruction: `You are a legal analysis assistant for Tenant Shield.
You must ground your answer strictly in the provided Exa research JSON.
Never invent laws, statutes, rights, deadlines, citations, or legal facts.
For "yourRights", only include rights directly supported by Exa results.
If Exa does not support a right, return exactly: "Local laws require verification".`,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
      responseMimeType: "application/json",
      temperature: 0,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caseStrength: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          yourRights: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          documentation: { type: Type.ARRAY, items: { type: Type.STRING } },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          userTimeline: { type: Type.ARRAY, items: { type: Type.STRING } },
          caseStrengthDescription: { type: Type.STRING },
        },
        required: [
          "caseStrength",
          "summary",
          "yourRights",
          "recommendedActions",
          "documentation",
          "redFlags",
          "userTimeline",
          "caseStrengthDescription",
        ],
      },
    };

    const geminiResponse = await generateWithFallback({
      config,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
    const aiAnalysisRaw = geminiResponse.text;
    if (!aiAnalysisRaw) {
      throw new Error("Gemini returned an empty response");
    }

    const generatedAiData = caseAnalysisSchema.parse(JSON.parse(aiAnalysisRaw));

    const textToEmbed = [
      "TENANT CASE RECORD",
      `Title: ${args.shortTitle}`,
      `Issue Type: ${args.issueType}`,
      `State: ${args.state}`,
      `City: ${args.city ?? "N/A"}`,
      `Landlord Name: ${args.landlordName ?? "N/A"}`,
      `Property Address: ${args.propertyAddress ?? "N/A"}`,
      "",
      "USER DESCRIPTION:",
      args.description,
      "",
      "AI ANALYSIS:",
      `Case Strength Score: ${generatedAiData.caseStrength}`,
      `Case Strength Reasoning: ${generatedAiData.caseStrengthDescription}`,
      `Summary: ${generatedAiData.summary}`,
      "",
      "YOUR RIGHTS:",
      ...generatedAiData.yourRights.map((item, index) => `${index + 1}. ${item}`),
      "",
      "RECOMMENDED ACTIONS:",
      ...generatedAiData.recommendedActions.map(
        (item, index) => `${index + 1}. ${item}`,
      ),
      "",
      "DOCUMENTATION NEEDED:",
      ...generatedAiData.documentation.map(
        (item, index) => `${index + 1}. ${item}`,
      ),
      "",
      "RED FLAGS:",
      ...generatedAiData.redFlags.map((item, index) => `${index + 1}. ${item}`),
      "",
      "USER TIMELINE:",
      ...generatedAiData.userTimeline.map((item, index) => `${index + 1}. ${item}`),
    ].join("\n");

    const embedResult = await ai.models.embedContent({
      model: "gemini-embedding-001",
      config: {
        outputDimensionality: 768,
      },
      contents: textToEmbed,
    });
    const generatedVector = embedResult.embeddings?.[0]?.values;
    if (!generatedVector) {
      throw new Error("Gemini returned an empty embedding");
    }

    const newCaseId: Id<"cases"> = (await ctx.runMutation(
      (internal as any)["cases/mutations"].saveCaseToDB,
      {
        userId,
        inputData,
        aiAnalysis: generatedAiData,
        embedding: generatedVector,
      },
    )) as Id<"cases">;

    const chunkPayloads = [
      {
        chunkType: "full_case",
        chunkText: textToEmbed,
      },
      {
        chunkType: "summary",
        chunkText: `Summary: ${generatedAiData.summary}\nCase Strength: ${generatedAiData.caseStrength}\nReasoning: ${generatedAiData.caseStrengthDescription}`,
      },
      {
        chunkType: "your_rights",
        chunkText: generatedAiData.yourRights.join("\n"),
      },
      {
        chunkType: "recommended_actions",
        chunkText: generatedAiData.recommendedActions.join("\n"),
      },
      {
        chunkType: "documentation",
        chunkText: generatedAiData.documentation.join("\n"),
      },
      {
        chunkType: "red_flags",
        chunkText: generatedAiData.redFlags.join("\n"),
      },
      {
        chunkType: "timeline",
        chunkText: generatedAiData.userTimeline.join("\n"),
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
      (internal as any)["cases/mutations"].saveCaseEmbeddingsToDB,
      {
        caseId: newCaseId,
        userId,
        chunks: chunkEmbeddings,
      },
    );

    return {
      caseId: newCaseId,
      aiAnalysis: generatedAiData,
    };
  },
});
