import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { stateTenantLawSchema } from "./aiSchema";
import Exa from "exa-js";
import { GoogleGenAI, Type } from "@google/genai";
import { US_STATES, US_STATE_NAMES } from "../../lib/constants/us-states";

export const generateStateLaw = internalAction({
  args: {
    stateCode: v.string(),
    stateName: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Starting law generation for: ${args.stateName} (${args.stateCode})`);
    
    const exa = new Exa(process.env.EXA_API_KEY as string);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

    const exaQuery = `landlord tenant law ${args.stateName} USA security deposit limit, rent grace period, notice to quit eviction, repair and deduct habitability`;
    
    // 1. Fetch grounded legal data from Exa
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
              required: ["topic", "statute", "description"],
              properties: {
                topic: { type: "string", description: "What this law covers (e.g. security deposit, grace period)" },
                statute: { type: "string", description: "Statute or section number" },
                description: { type: "string", description: "Summary of the law's rule" },
                link: { type: "string" },
              },
            },
          },
        },
      },
    });

    // 2. Pass Exa data to Gemini to extract the precise structured metrics
    const prompt = `You are a legal AI researcher extracting specific tenant rights metrics for ${args.stateName}.
Analyze the provided Exa research and fill out the JSON schema.
If a specific metric or law does not exist in the state, write "None" or "Not specified".
Be precise and concise. Keep values short (e.g. "2 months", "14 days", "None").

STATE: ${args.stateName} (${args.stateCode})
GROUNDED LEGAL RESEARCH (Exa JSON):
${JSON.stringify(exaResponse)}`;

    const config = {
      systemInstruction: `You are an expert legal data extraction assistant.
You must ground your answer strictly in the provided Exa research.
Return ONLY valid JSON matching the schema.`,
      responseMimeType: "application/json",
      temperature: 0,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headlineMetrics: {
            type: Type.OBJECT,
            properties: {
              depositCap: { type: Type.STRING },
              gracePeriod: { type: Type.STRING },
              noticeToQuit: { type: Type.STRING },
            },
            required: ["depositCap", "gracePeriod", "noticeToQuit"],
          },
          depositReturnTimeline: { type: Type.STRING },
          repairAndHabitability: {
            type: Type.OBJECT,
            properties: {
              landlordObligation: { type: Type.STRING },
              legalCitation: { type: Type.STRING },
              repairAndDeductAvailable: { type: Type.BOOLEAN },
            },
            required: ["landlordObligation"],
          },
          evictionNotice: {
            type: Type.OBJECT,
            properties: {
              nonpayment: { type: Type.STRING },
              otherBreach: { type: Type.STRING },
            },
            required: ["nonpayment", "otherBreach"],
          },
        },
        required: [
          "headlineMetrics",
          "depositReturnTimeline",
          "repairAndHabitability",
          "evictionNotice",
        ],
      },
    };

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

    let geminiResponse;
    try {
      geminiResponse = await generateWithFallback({
        config,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
    } catch (error) {
      console.error(`Gemini generation failed for ${args.stateCode}:`, error);
      throw error;
    }

    if (!geminiResponse.text) {
      throw new Error(`Empty Gemini response for ${args.stateCode}`);
    }

    // 3. Validate with Zod
    const parsedJSON = JSON.parse(geminiResponse.text);
    const lawDetails = stateTenantLawSchema.parse(parsedJSON);

    // 4. Save to Database
    await ctx.runMutation((internal as any)["stateLaws/mutations"].upsertStateLaw, {
      stateCode: args.stateCode,
      stateName: args.stateName,
      lawDetails,
    });
    
    console.log(`Successfully generated and saved laws for ${args.stateCode}`);
  },
});

export const populateAllStates = action({
  args: {},
  handler: async (ctx) => {
    console.log("Scheduling state law generation for all 50 states...");
    
    let delayMs = 0;
    // Stagger the jobs by 5 seconds each to avoid hitting API rate limits
    // (Exa and Gemini might throttle if 50 requests hit simultaneously)
    for (const stateCode of US_STATES) {
      const stateName = US_STATE_NAMES[stateCode];
      
      await ctx.scheduler.runAfter(
        delayMs,
        (internal as any)["stateLaws/actions"].generateStateLaw,
        { stateCode, stateName }
      );
      
      delayMs += 5000; // 5 second delay between each dispatch
    }
    
    return {
      status: "success",
      message: "Scheduled background jobs to populate all 50 states. This will take a few minutes to complete."
    };
  },
});
