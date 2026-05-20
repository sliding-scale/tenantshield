import { GoogleGenAI, Type } from "@google/genai";
import { leaseNotADocumentMessage } from "../../lib/lease/analyze-lease-errors";

type LeaseDocumentCheck = {
  isLease: boolean;
  reason: string;
};

async function generateWithFallback(params: {
  config: object;
  contents: Array<{ role: "user"; parts: Array<{ text: string }> }>;
}) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  const models = [
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-pro",
  ];
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
          await new Promise((resolve) =>
            setTimeout(resolve, 1200 * (attempt + 1)),
          );
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

export async function ensureLeaseDocument(leaseText: string): Promise<void> {
  const validationConfig = {
    systemInstruction: `You are a lease document gatekeeper.
Your only task is to decide whether the uploaded text is a real lease document that should be analyzed by a tenant-rights lease review tool.

Rules:
- Return false for notices, letters, applications, policies, summaries, blank forms, or unrelated documents.
- Return true only when the text is actually a lease, lease addendum, or lease renewal with landlord and tenant obligations.
- If the document is ambiguous or mixed, fail closed and return false.
- Explain the decision briefly using only the text you received.
- Return JSON only that matches the schema exactly.`,
    responseMimeType: "application/json",
    temperature: 0,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        isLease: { type: Type.BOOLEAN },
        reason: { type: Type.STRING },
      },
      required: ["isLease", "reason"],
    },
  };

  const response = await generateWithFallback({
    config: validationConfig,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Classify this uploaded document.

Document text:
${leaseText}`,
          },
        ],
      },
    ],
  });

  if (!response.text) {
    throw new Error("Lease document check returned an empty response.");
  }

  let parsed: LeaseDocumentCheck;
  try {
    parsed = JSON.parse(response.text) as LeaseDocumentCheck;
  } catch {
    throw new Error("Lease document check returned invalid JSON.");
  }

  if (!parsed.isLease) {
    throw new Error(leaseNotADocumentMessage(parsed.reason ?? ""));
  }
}
