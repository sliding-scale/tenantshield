"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UIMessage } from "ai";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, SendHorizontal, Square } from "lucide-react";
import { AssistantMarkdown } from "./assistant-markdown";
import { chatMessagesToUIMessages } from "./map-documents-to-ui-messages";
import type { ChatMessageDoc } from "./map-documents-to-ui-messages";

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
};

/** First resolved snapshot per conversation for useChat initial messages (Convex sync must not reset the thread). */
const frozenInitialByConversationId = new Map<string, UIMessage[]>();

export default function ChatThread({
  conversationId,
  storedMessages,
  selectedStateCode,
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
    />
  );
}

function ChatThreadLoaded({
  conversationId,
  initialMessages,
  selectedStateCode,
}: {
  conversationId: Id<"chatConversations">;
  initialMessages: ReturnType<typeof chatMessagesToUIMessages>;
  selectedStateCode: string | null;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        credentials: "same-origin",
      }),
    [],
  );

  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
  });

  const busy = status === "streaming" || status === "submitted";
  const [draft, setDraft] = useState("");
  const scrollEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const end = scrollEndRef.current;
    if (!end) return;
    const id = requestAnimationFrame(() => {
      end.scrollIntoView({ block: "end", behavior: "auto" });
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
        body: { conversationId, selectedStateCode },
      },
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col gap-3 py-12 text-center">
              <h3 className="font-heading text-2xl text-foreground md:text-3xl">
                Tenant Shield Assistant
              </h3>
              <p className="text-ink-warm-muted text-base leading-relaxed">
                Ask about your lease, past cases, letters you&apos;ve drafted, or
                tenant rights. Answers use your saved documents when available.
              </p>
            </div>
          ) : (
            <ul className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              {messages.map((m, idx) => {
                if (shouldHideInProgressAssistantRow(m, idx, messages, status)) {
                  return null;
                }
                const textParts = m.parts
                  .filter((p): p is { type: "text"; text: string } => p.type === "text")
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
            </ul>
          )}
          <div ref={scrollEndRef} className="h-px w-full shrink-0" aria-hidden />
        </div>

        {error ? (
          <div className="border-destructive/30 bg-destructive/10 mx-auto mb-2 flex max-w-3xl flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm">
            <span className="text-destructive shrink">{error.message}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => clearError()}>
              Dismiss
            </Button>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="border-cream-border bg-cream-page/90 sticky bottom-0 z-10 mt-auto shrink-0 border-t px-4 pt-4 pb-[max(1rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] backdrop-blur-md dark:bg-background/90 md:static md:z-0 md:px-8 md:pb-4"
        >
          <div className="mx-auto flex max-w-3xl gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message Tenant Shield…"
              rows={1}
              disabled={busy}
              className={cn(
                "border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring max-h-40 min-h-11 flex-1 resize-none rounded-xl border px-4 py-3 text-[15px] shadow-sm outline-none transition-[box-shadow] focus-visible:ring-3 disabled:opacity-60",
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
                className="shrink-0 self-end"
                aria-label="Stop generating"
                onClick={() => void stop()}
              >
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon-lg"
                className="shrink-0 self-end"
                disabled={!draft.trim()}
                aria-label="Send message"
              >
                <SendHorizontal className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
