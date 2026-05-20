"use client"

import { Sparkles } from "lucide-react"
import { FadeIn, FadeInStagger } from "@/components/shared/fade-in"
import { Button } from "@/components/ui/button"
import { askAiIntroSubtitle } from "@/lib/chat/ask-ai-copy"
import { ASK_AI_SUGGESTIONS } from "@/lib/chat/suggestion-prompts"

type AskAiEmptyStateProps = {
  selectedStateCode: string | null
  disabled?: boolean
  onSuggestion: (prompt: string) => void
}

export function AskAiEmptyState({
  selectedStateCode,
  disabled = false,
  onSuggestion,
}: AskAiEmptyStateProps) {
  return (
    <FadeInStagger className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-4 md:py-8">
      <FadeIn stagger className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground shadow-sm">
          <Sparkles className="size-7 text-primary" aria-hidden />
        </div>
        <h2 className="mt-5 font-heading text-3xl font-semibold leading-tight text-foreground text-balance md:text-4xl">
          How can I protect you today?
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
          {askAiIntroSubtitle(selectedStateCode)}
        </p>
      </FadeIn>

      <div className="flex w-full flex-col gap-2.5">
        {ASK_AI_SUGGESTIONS.map(({ label, prompt }) => (
          <FadeIn key={label} stagger className="w-full">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => onSuggestion(prompt)}
              className="h-auto min-h-12 w-full justify-start rounded-2xl border-border bg-card px-4 py-3.5 text-left text-sm font-medium leading-snug text-foreground shadow-none hover:bg-accent"
            >
              {label}
            </Button>
          </FadeIn>
        ))}
      </div>
    </FadeInStagger>
  )
}
