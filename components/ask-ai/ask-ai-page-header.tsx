"use client"

import ChatStatePicker from "./chat-state-picker"
import { ChatSidebarMobileToggle } from "./chat-sidebar"

type AskAiPageHeaderProps = {
  selectedStateCode: string | null
  onStateChange: (stateCode: string) => void
  onOpenSidebar: () => void
  statePickerId?: string
}

export function AskAiPageHeader({
  selectedStateCode,
  onStateChange,
  onOpenSidebar,
  statePickerId,
}: AskAiPageHeaderProps) {
  return (
    <header className="shrink-0 px-4 pt-4 pb-2 md:px-6 md:pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-semibold leading-tight text-foreground md:text-3xl">
            AI Assistant
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ChatSidebarMobileToggle onClick={onOpenSidebar} />
          <ChatStatePicker
            id={statePickerId}
            value={selectedStateCode}
            onChange={onStateChange}
          />
        </div>
      </div>
    </header>
  )
}
