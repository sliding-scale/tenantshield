"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UIMessage } from "ai";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, SendHorizontal, Square, Sparkles } from "lucide-react";
import { resolveAskAiStateForApi } from "@/lib/chat/ask-ai-state";
import { isLikelyRetrievalFailureResponse } from "@/lib/chat/response-utils";
import { chatMessagesToUIMessages } from "./map-documents-to-ui-messages";
import type { ChatMessageDoc } from "./map-documents-to-ui-messages";
import { AssistantMarkdown } from "./assistant-markdown";
import {
  hasReachedFreeChatMessageLimit,
  type PlanId,
} from "@/lib/plans/plan-access";
import Link from "next/link";

/** Wait until this much assistant text exists before showing the assistant row (avoids empty bubble). */
const MIN_ASSISTANT_CHARS = 8;
const MIN_ASSISTANT_WORDS = 3;

function assistantTextFromParts(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function hasEnoughAssistantContent(text: string): boolean {
  const t = text.trim();
  if (t.length >= MIN_ASSISTANT_CHARS) return true;
  const words = t.split(/\s+/).filter(Boolean);
  return words.length >= MIN_ASSISTANT_WORDS;
}

function ChatRetryBanner({
  onRetry,
  retrying,
  onDismiss,
  message = "We couldn't load an answer. This is usually temporary.",
}: {
  onRetry: () => void;
  retrying: boolean;
  onDismiss?: () => void;
  message?: string;
}) {
  return (
    <div className="border-cream-border bg-cream-surface/80 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm">
      <span className="text-ink-warm-muted min-w-0 flex-1">{message}</span>
      <Button
        type="button"
        size="sm"
        className="gap-1.5"
        disabled={retrying}
        onClick={onRetry}
      >
        {retrying ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-3.5" aria-hidden />
        )}
        {retrying ? "Retrying…" : "Retry"}
      </Button>
      {onDismiss ? (
        <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      ) : null}
    </div>
  );
}

function shouldHideInProgressAssistantRow(
  m: UIMessage,
  index: number,
  messages: UIMessage[],
  status: string,
): boolean {
  if (m.role !== "assistant") return false;
  const isLast = index === messages.length - 1;
  if (!isLast) return false;
  const waiting = status === "streaming" || status === "submitted";
  if (!waiting) return false;
  return !hasEnoughAssistantContent(assistantTextFromParts(m));
}

type ChatThreadProps = {
  conversationId: Id<"chatConversations">;
  /** Convex rows; undefined = still loading */
  storedMessages: ChatMessageDoc[] | undefined;
  /** US state code selected by user in the state picker */
  selectedStateCode: string | null;
  plan: PlanId;
};

/** First resolved snapshot per conversation for useChat initial messages (Convex sync must not reset the thread). */
const frozenInitialByConversationId = new Map<string, UIMessage[]>();

export default function ChatThread({
  conversationId,
  storedMessages,
  selectedStateCode,
  plan,
}: ChatThreadProps) {
  const initialMessages = useMemo(() => {
    const cached = frozenInitialByConversationId.get(conversationId);
    if (cached) {
      return cached;
    }
    if (storedMessages === undefined) {
      return undefined;
    }
    const mapped = chatMessagesToUIMessages(storedMessages);
    frozenInitialByConversationId.set(conversationId, mapped);
    return mapped;
  }, [conversationId, storedMessages]);

  if (initialMessages === undefined) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm">Loading conversation…</p>
      </div>
    );
  }

  return (
    <ChatThreadLoaded
      key={conversationId}
      conversationId={conversationId}
      initialMessages={initialMessages}
      selectedStateCode={selectedStateCode}
      plan={plan}
    />
  );
}

function ChatThreadLoaded({
  conversationId,
  initialMessages,
  selectedStateCode,
  plan,
}: {
  conversationId: Id<"chatConversations">;
  initialMessages: ReturnType<typeof chatMessagesToUIMessages>;
  selectedStateCode: string | null;
  plan: PlanId;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        credentials: "same-origin",
      }),
    [],
  );

  const messageListRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error, clearError, regenerate } =
    useChat({
      id: conversationId,
      messages: initialMessages,
      transport,
    });

  const busy = status === "streaming" || status === "submitted";
  const [retrying, setRetrying] = useState(false);
  const [draft, setDraft] = useState("");
  const stateCodeForApi = useMemo(
    () => resolveAskAiStateForApi(selectedStateCode),
    [selectedStateCode],
  );

  const userMessageCount = useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages],
  );
  const isLimitReached = hasReachedFreeChatMessageLimit(plan, userMessageCount);

  const last = messages[messages.length - 1];
  const deferringAssistantBubble =
    busy &&
    last?.role === "assistant" &&
    !hasEnoughAssistantContent(assistantTextFromParts(last));
  const showThinkingRow =
    busy &&
    (messages.length === 0 ||
      last?.role === "user" ||
      deferringAssistantBubble);

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const showRetryForResponse =
    !busy &&
    !error &&
    lastAssistantMessage != null &&
    isLikelyRetrievalFailureResponse(
      assistantTextFromParts(lastAssistantMessage),
    );

  async function handleRetryLast() {
    if (busy || retrying) return;
    setRetrying(true);
    clearError();
    try {
      await regenerate({
        body: { conversationId, selectedStateCode: stateCodeForApi },
      });
    } finally {
      setRetrying(false);
    }
  }

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    const id = requestAnimationFrame(() => {
      list.scrollTop = list.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [messages, status, showThinkingRow]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    await sendMessage(
      { text },
      {
        body: { conversationId, selectedStateCode: stateCodeForApi },
      },
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={messageListRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 pb-4 max-md:pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:px-8"
      >
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col gap-3 py-12 text-center">
              <h3 className="font-heading text-2xl text-foreground md:text-3xl">
                Tenant Shield Assistant
              </h3>
              <p className="text-ink-warm-muted text-base leading-relaxed">
                Ask about your lease, past cases, letters you&apos;ve drafted,
                or tenant rights. Answers use your saved documents when
                available.
              </p>
            </div>
          ) : (
            <ul className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              {messages.map((m, idx) => {
                if (
                  shouldHideInProgressAssistantRow(m, idx, messages, status)
                ) {
                  return null;
                }
                const textParts = m.parts
                  .filter(
                    (p): p is { type: "text"; text: string } =>
                      p.type === "text",
                  )
                  .map((p) => p.text);
                const combinedText = textParts.join("\n\n");
                return (
                  <li
                    key={m.id}
                    className={cn(
                      "flex max-w-full flex-col gap-1",
                      m.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <span className="text-ink-warm-muted mb-0.5 text-xs font-medium uppercase tracking-wide">
                      {m.role === "user" ? "You" : "Assistant"}
                    </span>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm",
                        m.role === "user"
                          ? "border-cream-border w-fit max-w-[min(100%,42rem)] border bg-cream-page dark:bg-card/30"
                          : "border-cream-border mr-auto max-w-[min(100%,48rem)] border bg-background dark:bg-card/50",
                      )}
                    >
                      {m.role === "assistant" ? (
                        <AssistantMarkdown text={combinedText} />
                      ) : (
                        textParts.map((t, i) => (
                          <p key={i} className="whitespace-pre-wrap">
                            {t}
                          </p>
                        ))
                      )}
                    </div>
                  </li>
                );
              })}
              {showThinkingRow ? (
                <li className="text-ink-warm-muted flex items-center gap-2 text-sm">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Thinking…
                </li>
              ) : null}
              {showRetryForResponse ? (
                <li className="mx-auto w-full max-w-3xl">
                  <ChatRetryBanner
                    onRetry={() => void handleRetryLast()}
                    retrying={retrying}
                    message="The answer may not have loaded fully. Tap Retry to try again."
                  />
                </li>
              ) : null}
              {isLimitReached && !busy && (
                <li className="mt-4">
                  <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center shadow-sm">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                      <Sparkles className="size-6" />
                    </div>
                    <h4 className="font-heading text-xl font-semibold text-ink-warm">
                      Chat limit reached
                    </h4>
                    <p className="mt-2 text-ink-warm-muted text-sm leading-relaxed max-w-md mx-auto">
                      You&apos;ve sent 5 messages in this conversation. Upgrade
                      to a paid plan for unlimited AI guidance and deeper legal
                      research.
                    </p>
                    <Button
                      asChild
                      className="mt-5 h-11 rounded-xl bg-surface-strong px-6 text-sm font-semibold text-white shadow-sm hover:bg-surface-strong-hover"
                    >
                      <Link href="/billing">Upgrade to continue</Link>
                    </Button>
                  </div>
                </li>
              )}
            </ul>
          )}
      </div>

      {error ? (
        <div className="mx-auto mb-2 max-w-3xl shrink-0 px-4 max-md:pb-2 md:px-8">
          <ChatRetryBanner
            onRetry={() => void handleRetryLast()}
            retrying={retrying}
            onDismiss={() => clearError()}
            message={error.message}
          />
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="border-cream-border bg-cream-page/95 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 shrink-0 border-t px-4 pt-4 pb-[max(1rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] backdrop-blur-md dark:bg-background/95 md:relative md:z-0 md:px-8 md:pb-4"
      >
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                isLimitReached ? "Chat limit reached" : "Message Tenant Shield…"
              }
              rows={1}
              disabled={busy || isLimitReached}
              className={cn(
                "border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring max-h-40 min-h-11 flex-1 resize-none rounded-xl border px-4 py-2.5 text-[15px] leading-snug shadow-sm outline-none transition-[box-shadow] focus-visible:ring-3 disabled:opacity-60",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              aria-label="Message input"
            />
            {busy ? (
              <Button
                type="button"
                variant="secondary"
                size="icon-lg"
                className="size-11 shrink-0 rounded-xl"
                aria-label="Stop generating"
                onClick={() => void stop()}
              >
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon-lg"
                className="size-11 shrink-0 rounded-xl"
                disabled={!draft.trim() || isLimitReached}
                aria-label="Send message"
              >
                <SendHorizontal className="size-4" />
              </Button>
            )}
          </div>
      </form>
    </div>
  );
}
