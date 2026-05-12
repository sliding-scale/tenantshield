import { auth } from "@clerk/nextjs/server";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, summarizationMiddleware, modelCallLimitMiddleware } from "langchain";
import { ConvexHttpClient } from "convex/browser";
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { createTenantChatTools } from "@/lib/chat/tools";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export const maxDuration = 60;

// ============================================================
// Suppress LangGraph Pregel background task errors that escape
// as unhandled rejections (e.g. "Failed to parse stream").
// These originate in detached async contexts inside LangGraph
// and cannot be caught by any try/catch in user code.
// ============================================================
if (typeof process !== "undefined" && !(process as any).__chatUnhandledRejectionInstalled) {
  (process as any).__chatUnhandledRejectionInstalled = true;
  process.on("unhandledRejection", (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (/failed to parse stream/i.test(msg) || /pregelTaskId/i.test(msg)) {
      console.warn("[Suppressed] LangGraph stream parse error:", msg);
      return; // swallow — the user-facing stream already has error handling
    }
    // Re-throw anything else so other unhandled rejections still surface
    throw err;
  });
}

/**
 * Wraps an async iterable so that iteration errors are caught and
 * the stream ends gracefully instead of throwing.
 */
async function* safeAsyncIterable<T>(source: AsyncIterable<T>): AsyncIterable<T> {
  try {
    for await (const item of source) {
      yield item;
    }
  } catch (err) {
    console.warn("[safeAsyncIterable] Stream error caught and suppressed:", err);
    // Stream ends cleanly — error is handled by the writer/onError layer
  }
}

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

    const body = (await req.json()) as {
      messages?: UIMessage[];
      conversationId?: string;
      selectedStateCode?: string | null;
    };
    const { messages, conversationId, selectedStateCode } = body;
    // console.log("[Chat API] body keys:", Object.keys(body));
    // console.log("[Chat API] selectedStateCode:", selectedStateCode);
    // console.log("[Chat API] conversationId:", conversationId);
    // console.log("[Chat API] messages count:", messages?.length);
    if (!messages?.length) {
      return Response.json({ error: "Bad Request: messages required" }, { status: 400 });
    }
    if (!conversationId) {
      return Response.json(
        { error: "Bad Request: conversationId required" },
        { status: 400 },
      );
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    const conversation = await convex.query(api.chat.queries.getConversation, {
      conversationId: conversationId as Id<"chatConversations">,
    });
    if (!conversation) {
      return Response.json(
        { error: "Forbidden or conversation not found." },
        { status: 403 },
      );
    }

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
        model: "gemini-2.5-flash",
        apiKey,
        temperature: 0,
      });
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

TOOL USAGE RULES (MANDATORY — follow exactly):
1. Pick ONE tool per question. Call it ONCE. Read the result. Then reply to the user immediately.
2. NEVER call the same tool twice for the same question — even with a different query.
3. Use at most 2 tool calls total per user message. After that, answer with whatever you have.
4. If a tool returns data, use it to answer right away. Do NOT call additional tools "just to be thorough".
5. If a tool returns no data, tell the user immediately and suggest the right Tenant Shield feature.

TOOL SELECTION (pick the first match):
- Lease questions ("Am I allowed to…", "Does my lease say…") → search_my_leases
- Past case / dispute questions → search_my_cases
- Letter questions → search_my_letters
- General legal / state law questions → research_state_laws
- If the question spans lease + law, call search_my_leases first, then research_state_laws. Stop after these 2.

RESPONSE RULES:
- NEVER invent laws, statutes, lease terms, or legal facts.
- Always cite the source document or law you reference.
- Do not ask the user for their user id — retrieval is already scoped to their signed-in account.
- Keep answers concise and actionable.

WHEN TOOLS RETURN NO DATA:
- Tell the user clearly: "I don't have that data yet."
- Suggest the feature: "Upload your lease via Analyze Lease", "Submit a case via New Case", or "Draft a letter via Write Letter".
- Do NOT retry the tool or try alternative queries. Just inform the user and stop.

JURISDICTION & FOLLOW-UP RULES:
${selectedStateCode ? `- CRITICAL: The user has ALREADY selected "${selectedStateCode}" as their US state. Use this for all legal questions.
- NEVER ask the user what state they are in. You already know it is ${selectedStateCode}.` : `- If the user's state is needed to answer a legal question and they haven't provided it, ask them which state they are in.
- Ask ONE follow-up question max, then proceed.`}`;

    const agent = createAgent({
      model,
      tools,
      systemPrompt,
      middleware: [
        modelCallLimitMiddleware({ runLimit: 4 }),
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
            conversationId: conversationId as Id<"chatConversations">,
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
        { version: "v2", recursionLimit: 20 },
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
          modelCallLimitMiddleware({ runLimit: 4 }),
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
        { version: "v2", recursionLimit: 20 },
      );
    }

    // ---- Build streaming response ----
    // Wrap event stream so iteration errors don't escape as unhandled rejections
    const uiEventStream = toUIMessageStream(safeAsyncIterable(eventStream) as any);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        try {
          await writer.merge(uiEventStream);
        } catch (streamErr) {
          const errMsg = streamErr instanceof Error ? streamErr.message : String(streamErr);
          if (/recursion limit/i.test(errMsg)) {
            console.warn("Agent hit recursion limit:", errMsg);
            writer.write({
              type: "error",
              errorText: "I\u2019m sorry \u2014 your question required too many steps to process. Could you try rephrasing it more specifically?",
            });
          } else {
            console.error("Stream error:", streamErr);
            writer.write({
              type: "error",
              errorText: "Something went wrong while generating a response. Please try asking your question again.",
            });
          }
        }
      },
      onError: (error) => {
        // This callback controls what the client receives as the error string.
        // Return a user-friendly message instead of raw stack traces.
        const msg = error instanceof Error ? error.message : String(error);
        console.error("createUIMessageStream onError:", msg);
        if (/failed to parse stream/i.test(msg)) {
          return "The AI service had a temporary issue. Please try your question again.";
        }
        if (/recursion limit/i.test(msg)) {
          return "Your question required too many steps. Please rephrase and try again.";
        }
        return "Something went wrong. Please try again.";
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
              conversationId: conversationId as Id<"chatConversations">,
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
    const raw = error instanceof Error ? error.message : "Internal Server Error";
    // Map known technical errors to user-friendly messages
    const message = /recursion limit/i.test(raw)
      ? "Your question required too many processing steps. Please try rephrasing it more specifically and ask again."
      : raw;
    return Response.json({ error: message }, { status: 500 });
  }
}
