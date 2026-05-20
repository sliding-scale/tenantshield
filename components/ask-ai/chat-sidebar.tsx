"use client";

import { MessageSquarePlus, MessagesSquare, PanelLeftClose, Plus } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "./format-relative";

export type ConversationSummary = Doc<"chatConversations">;

type ChatSidebarProps = {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  /** Mobile drawer */
  open: boolean;
  onClose: () => void;
};

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewChat,
  open,
  onClose,
}: ChatSidebarProps) {
  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "border-border bg-accent z-50 flex min-h-0 w-[min(100vw-2rem,280px)] shrink-0 flex-col border-r md:relative md:h-full md:w-[280px] md:self-stretch",
          open
            ? "fixed inset-y-0 left-0 flex md:relative md:inset-auto"
            : "hidden md:flex",
        )}
      >
        <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              aria-label="Close menu"
              onClick={onClose}
            >
              <PanelLeftClose className="size-4" />
            </Button>
            <h2 className="font-heading truncate text-base text-foreground">
              Ask AI
            </h2>
          </div>
        </div>

        <div className="p-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 border-border bg-background/80 font-medium dark:bg-card/40"
            onClick={() => {
              onNewChat();
              onClose();
            }}
          >
            <MessageSquarePlus className="size-4 shrink-0 text-primary" />
            New chat
          </Button>
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4"
          aria-label="Past conversations"
        >
          {conversations.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">
              No chats yet. Start with New chat.
            </p>
          ) : (
            conversations.map((c) => {
              const active = activeConversationId === c._id;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => {
                    onSelect(c._id);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full flex-col items-start rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <span className="line-clamp-2 w-full font-medium text-foreground">
                    {c.title}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeTime(c.updatedAt)}
                  </span>
                </button>
              );
            })
          )}
        </nav>
      </aside>
    </>
  );
}

export function ChatSidebarMobileToggle({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="border-border shrink-0 md:hidden"
      aria-label="Open chats"
      onClick={onClick}
    >
      <span className="relative inline-flex size-4 shrink-0" aria-hidden>
        <MessagesSquare className="size-4" />
        <span className="absolute -right-1 -bottom-1 flex size-2.5 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <Plus className="size-2" strokeWidth={3} />
        </span>
      </span>
    </Button>
  );
}
