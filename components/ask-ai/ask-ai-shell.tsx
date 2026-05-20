'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AskAiPageHeader } from './ask-ai-page-header';
import ChatSidebar from './chat-sidebar';
import ChatThread from './chat-thread';
import useCurrentUser from '@/app/hooks/useCurrentUser';
import { ASK_AI_DEFAULT_STATE_CODE, readAskAiStoredState, writeAskAiStoredState } from '@/lib/chat/ask-ai-state';
import { normalizeUserStateAbbr } from '@/lib/constants/us-states';
import { resolvePlanId, shouldPromptFreePlanChatUpgrade } from '@/lib/plans/plan-access';
import { PlanUpgradeDialog } from '@/components/tenant/free-plan-upgrade-dialog';
import { GavelLoader } from '@/components/shared/gavel-loader';
import { cn } from '@/lib/utils';

export default function AskAiShell() {
  const { isLoaded, userId } = useAuth();
  const { convexUser, isLoading: userLoading } = useCurrentUser();
  const planUsage = useQuery(api.planUsage.queries.current, isLoaded && userId ? {} : 'skip');
  const createConversation = useMutation(api.chat.mutations.createConversation);

  const conversations = useQuery(api.chat.queries.listConversations, isLoaded && userId ? {} : 'skip');

  const [pickedConversationId, setPickedConversationId] = useState<Id<'chatConversations'> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState<string>(ASK_AI_DEFAULT_STATE_CODE);
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

  const fallbackFirst = conversations && conversations.length > 0 ? conversations[0]._id : null;

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
    activeConversationId ? { conversationId: activeConversationId } : 'skip',
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
    setPickedConversationId(id as Id<'chatConversations'>);
  }, []);

  if (!isLoaded || !userId) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center px-4'>
        <GavelLoader variant='ask-ai' embedded label='Loading…' description='' />
      </div>
    );
  }

  if (conversations === undefined || activeConversationId === null) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center px-4'>
        <GavelLoader variant='ask-ai' embedded />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden bg-background",
        "max-md:max-h-[calc(100svh-3.75rem-env(safe-area-inset-bottom,0px))] md:h-svh md:max-h-svh",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col md:flex-row md:items-stretch">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={handleSelect}
          onNewChat={() => void handleNewChat()}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <section className='flex min-h-0 min-w-0 flex-1 flex-col'>
          <AskAiPageHeader
            selectedStateCode={selectedStateCode}
            onStateChange={handleStateChange}
            onOpenSidebar={() => setSidebarOpen(true)}
            statePickerId='ask-ai-state-mobile'
          />
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
        title='Upgrade to start more chats'
        description='Your free plan includes one AI chat conversation. Upgrade to Pro or Ultimate for unlimited chats and deeper legal guidance.'
        eyebrow='Free plan limit'
        primaryActionLabel='View plans'
        primaryActionHref='/billing'
      />
    </div>
  );
}
