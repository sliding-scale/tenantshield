import { auth } from "@clerk/nextjs/server";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, summarizationMiddleware, modelCallLimitMiddleware } from "langchain";
import { ConvexHttpClient } from "convex/browser";
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { createTenantChatTools } from "@/lib/chat/tools";
import { api } from "@/convex/_generated/api";

export const maxDuration = 60;

// ============================================================
// Simple in-memory per-user rate limiter (150 messages / day)
// Resets when the server restarts or the window expires.
// ============================================================
const RATE_LIMIT = 150;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateBucket>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const bucket = rateLimitMap.get(userId);

  if (!bucket || now >= bucket.resetAt) {
    // New window
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (bucket.count >= RATE_LIMIT) {
    return false;
  }

  bucket.count += 1;
  return true;
}

// ============================================================
// POST /api/chat
// ============================================================
export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ---- Rate limit check ----
    if (!checkRateLimit(userId)) {
      return Response.json(
        { error: "Rate limit exceeded. You can send up to 150 messages per day. Please try again later." },
        { status: 429 },
      );
    }

    const token = await getToken({ template: "convex" });
    if (!token) {
      return Response.json(
        { error: "Unauthorized: Missing Convex JWT. Add a Clerk JWT template named 'convex' for this app." },
        { status: 401 },
      );
    }

    const body = (await req.json()) as { messages?: UIMessage[] };
    const { messages } = body;
    if (!messages?.length) {
      return Response.json({ error: "Bad Request: messages required" }, { status: 400 });
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Server misconfiguration: GEMINI_API_KEY not set" },
        { status: 500 },
      );
    }

    // ---- Primary model with fallback ----
    let model: ChatGoogleGenerativeAI;
    try {
      model = new ChatGoogleGenerativeAI({
        model: "gemini-3-flash-preview",
        apiKey,
        temperature: 0,
      });
      // Quick validation — will throw immediately if the model name is invalid
      // (actual validation happens on first call, handled below in agent stream)
    } catch {
      model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-pro",
        apiKey,
        temperature: 0,
      });
    }

    const summaryModel = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      apiKey,
      temperature: 0,
    });

    const tools = createTenantChatTools(convex);

    const systemPrompt = `You are the Tenant Shield AI Legal Assistant.
Your job is to answer the user's questions about their tenancy, lease, past cases, and state laws.

CRITICAL INSTRUCTIONS:
1. NEVER invent laws or guess lease terms. You must use your tools to find the answers.
2. If the user asks about their lease (e.g., "Am I allowed to have pets?"), use the search_my_leases tool FIRST.
3. If the user asks about a past dispute, use the search_my_cases tool.
4. If the user asks a general legal question, use the research_state_laws tool.
5. Always cite the document or law you are pulling the information from.
6. Do not ask the user for their user id; retrieval is already scoped to their signed-in account.

FOLLOW-UP QUESTIONS:
- If the user's question is missing critical context (e.g., which US state they are in for a legal question), ask ONE focused follow-up question to get that info before proceeding.
- Do NOT ask multiple follow-up questions at once. Ask the most important missing piece, then proceed with what you have.
- Never assume or guess the user's state, city, or personal details.
- If the user has already provided their state in an earlier message, remember and use it — do not ask again.

WHEN TOOLS RETURN NO DATA:
- If a tool says no documents were found, inform the user clearly and suggest which Tenant Shield feature they can use to add that data (e.g., "Upload your lease via Analyze Lease", "Submit a case via New Case", "Draft a letter via Write Letter").`;

    const agent = createAgent({
      model,
      tools,
      systemPrompt,
      middleware: [
        modelCallLimitMiddleware({ runLimit: 10 }),
        summarizationMiddleware({
          model: summaryModel,
          trigger: { messages: 50 },
          keep: { messages: 24 },
          summaryPrompt:
            "Summarize the following tenant/legal assistant conversation for context. Preserve important facts: dates, amounts, state, party names, and any commitments or deadlines. Omit small talk.",
        }),
      ],
    });

    // ---- Persist the incoming user message ----
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (lastUserMessage) {
      // Extract text from the UIMessage parts array
      const userText = lastUserMessage.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");

      if (userText) {
        try {
          await convex.mutation(api.chat.mutations.saveMessage, {
            role: "user" as const,
            content: userText,
          });
        } catch (e) {
          // Don't fail the whole request if saving history fails
          console.error("Failed to save user message to history:", e);
        }
      }
    }

    // ---- Convert UI messages to LangChain format and stream ----
    const langchainMessages = await toBaseMessages(messages);

    let eventStream;
    try {
      eventStream = await agent.streamEvents(
        { messages: langchainMessages },
        { version: "v2" },
      );
    } catch (streamError) {
      // Fallback: if the primary model fails, retry with gemini-2.5-pro
      console.warn("Primary model failed, falling back to gemini-2.5-pro:", streamError);

      const fallbackModel = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-pro",
        apiKey,
        temperature: 0,
      });

      const fallbackAgent = createAgent({
        model: fallbackModel,
        tools,
        systemPrompt,
        middleware: [
          modelCallLimitMiddleware({ runLimit: 10 }),
          summarizationMiddleware({
            model: summaryModel,
            trigger: { messages: 50 },
            keep: { messages: 24 },
            summaryPrompt:
              "Summarize the following tenant/legal assistant conversation for context. Preserve important facts: dates, amounts, state, party names, and any commitments or deadlines. Omit small talk.",
          }),
        ],
      });

      eventStream = await fallbackAgent.streamEvents(
        { messages: langchainMessages },
        { version: "v2" },
      );
    }

    // ---- Build streaming response ----
    // Use createUIMessageStream to get onFinish, then wrap with response helper
    const uiEventStream = toUIMessageStream(eventStream);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.merge(uiEventStream);
      },
      onFinish: async ({ responseMessage }) => {
        // Persist the assistant response after streaming completes
        const assistantText = responseMessage.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("");

        if (assistantText) {
          try {
            await convex.mutation(api.chat.mutations.saveMessage, {
              role: "assistant",
              content: assistantText,
            });
          } catch (e) {
            console.error("Failed to save assistant message to history:", e);
          }
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return Response.json({ error: message }, { status: 500 });
  }
}
