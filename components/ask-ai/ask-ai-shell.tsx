"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import ChatSidebar, { ChatSidebarMobileToggle } from "./chat-sidebar";
import ChatStatePicker from "./chat-state-picker";
import ChatThread from "./chat-thread";
import useCurrentUser from "@/app/hooks/useCurrentUser";
import {
  ASK_AI_DEFAULT_STATE_CODE,
  readAskAiStoredState,
  writeAskAiStoredState,
} from "@/lib/chat/ask-ai-state";
import { normalizeUserStateAbbr } from "@/lib/constants/us-states";
import { resolvePlanId, shouldPromptFreePlanChatUpgrade } from "@/lib/plans/plan-access";
import { PlanUpgradeDialog } from "@/components/tenant/free-plan-upgrade-dialog";
import { GavelLoader } from "@/components/shared/gavel-loader";

export default function AskAiShell() {
  const { isLoaded, userId } = useAuth();
  const { convexUser, isLoading: userLoading } = useCurrentUser();
  const planUsage = useQuery(
    api.planUsage.queries.current,
    isLoaded && userId ? {} : "skip",
  );
  const createConversation = useMutation(api.chat.mutations.createConversation);

  const conversations = useQuery(
    api.chat.queries.listConversations,
    isLoaded && userId ? {} : "skip",
  );

  const [pickedConversationId, setPickedConversationId] =
    useState<Id<"chatConversations"> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState<string>(
    ASK_AI_DEFAULT_STATE_CODE,
  );
  const creatingFirstConversationRef = useRef(false);
  const didInitState = useRef(false);

  const plan = resolvePlanId(planUsage?.plan ?? convexUser?.plan);

  useEffect(() => {
    if (didInitState.current || userLoading) return;
    didInitState.current = true;

    const stored = readAskAiStoredState();
    if (stored) {
      setSelectedStateCode(stored);
      return;
    }

    const fromProfile = normalizeUserStateAbbr(convexUser?.state);
    setSelectedStateCode(fromProfile || ASK_AI_DEFAULT_STATE_CODE);
  }, [convexUser?.state, userLoading]);

  const handleStateChange = useCallback((stateCode: string) => {
    setSelectedStateCode(stateCode);
    writeAskAiStoredState(stateCode);
  }, []);

  const fallbackFirst =
    conversations && conversations.length > 0 ? conversations[0]._id : null;

  const activeConversationId = pickedConversationId ?? fallbackFirst ?? null;

  useEffect(() => {
    if (conversations === undefined || conversations.length > 0) return;
    if (creatingFirstConversationRef.current) return;
    creatingFirstConversationRef.current = true;
    void createConversation({})
      .then((id) => setPickedConversationId(id))
      .catch(() => {
        creatingFirstConversationRef.current = false;
      });
  }, [conversations, createConversation]);

  const storedMessages = useQuery(
    api.chat.queries.getConversationMessages,
    activeConversationId ? { conversationId: activeConversationId } : "skip",
  );

  const handleNewChat = useCallback(async () => {
    if (shouldPromptFreePlanChatUpgrade(plan, conversations?.length ?? 0)) {
      setUpgradeDialogOpen(true);
      return;
    }
    const id = await createConversation({});
    setPickedConversationId(id);
  }, [plan, conversations?.length, createConversation]);

  const handleSelect = useCallback((id: string) => {
    setPickedConversationId(id as Id<"chatConversations">);
  }, []);

  if (!isLoaded || !userId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <GavelLoader variant="ask-ai" embedded label="Loading…" description="" />
      </div>
    );
  }

  if (conversations === undefined || activeConversationId === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <GavelLoader variant="ask-ai" embedded />
      </div>
    );
  }

  return (
    <div className="bg-background flex h-svh max-h-svh flex-col overflow-hidden md:h-svh md:max-h-svh">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row md:items-stretch">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={handleSelect}
          onNewChat={() => void handleNewChat()}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="border-border flex shrink-0 items-center gap-2 border-b bg-background/90 px-3 py-2.5 backdrop-blur md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="border-border shrink-0 gap-1.5 px-2.5 text-xs font-medium"
              asChild
            >
              {/* <Link href="/dashboard">
                <LayoutDashboard className="size-3.5 shrink-0" aria-hidden />
                Dashboard
              </Link> */}
            </Button>
            <ChatSidebarMobileToggle onClick={() => setSidebarOpen(true)} />
            <div className="min-w-0 flex-1 text-right">
              <p className="font-heading text-center truncate text-lg leading-tight">
                Ask AI
              </p>
              <p className="text-center text-muted-foreground truncate text-xs">
                Lease, cases & tenant rights
              </p>
            </div>
            <ChatStatePicker
              value={selectedStateCode}
              onChange={handleStateChange}
              className="shrink-0"
            />
          </header>
          <div className="justify-center border-border bg-background/90 hidden shrink-0 items-center md:justify-end border-b px-4 py-2 backdrop-blur md:flex">
            <ChatStatePicker
              id="ask-ai-state-desktop"
              value={selectedStateCode}
              onChange={handleStateChange}
            />
          </div>
          <ChatThread
            conversationId={activeConversationId}
            storedMessages={storedMessages}
            selectedStateCode={selectedStateCode}
            plan={plan}
          />
        </section>
      </div>
      <PlanUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        title="Upgrade to start more chats"
        description="Your free plan includes one AI chat conversation. Upgrade to Pro or Ultimate for unlimited chats and deeper legal guidance."
        eyebrow="Free plan limit"
        primaryActionLabel="View plans"
        primaryActionHref="/billing"
      />
    </div>
  );
}
