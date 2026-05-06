"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { Button } from "@/components/ui/button"

type OptionKey = "option1" | "option2" | "option3" | "option4"

const optionOrder: OptionKey[] = ["option1", "option2", "option3", "option4"]

export default function OnboardingMain() {
  const router = useRouter()
  const { clerkUser, role, isLoading: userLoading } = useCurrentUser()
  const status = useQuery(api.onboarding.queries.onboardingStatus, clerkUser ? {} : "skip")
  const questions = useQuery(
    api.onboarding.queries.questionsForCurrentUser,
    clerkUser ? {} : "skip",
  )
  const saveResponse = useMutation(api.onboarding.mutations.saveResponse)
  const finalizeOnboarding = useMutation(api.onboarding.mutations.finalizeOnboarding)
  const skipOnboarding = useMutation(api.onboarding.mutations.skip)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, OptionKey>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const hasInitializedIndex = useRef(false)

  useEffect(() => {
    if (!clerkUser) return
    if (role && role !== "tenant") {
      router.replace("/dashboard")
    }
  }, [clerkUser, role, router])

  useEffect(() => {
    if (!questions || questions.length === 0) return

    const selectedMap: Record<string, OptionKey> = {}
    for (const question of questions) {
      if (question.selectedOption) {
        selectedMap[question._id] = question.selectedOption
      }
    }
    setSelectedByQuestion(selectedMap)

    if (!hasInitializedIndex.current) {
      const firstUnanswered = questions.findIndex((question) => !selectedMap[question._id])
      setCurrentIndex(firstUnanswered === -1 ? questions.length - 1 : firstUnanswered)
      hasInitializedIndex.current = true
      return
    }

    // Keep the user on their in-progress step after data refreshes.
    setCurrentIndex((prev) => Math.min(prev, questions.length - 1))
  }, [questions])

  useEffect(() => {
    if (!status) return
    if (!status.shouldShowOnboarding) {
      router.replace("/dashboard")
    }
  }, [status, router])

  const currentQuestion = useMemo(() => {
    if (!questions || questions.length === 0) return null
    return questions[Math.max(0, Math.min(currentIndex, questions.length - 1))]
  }, [questions, currentIndex])

  const currentSelection = currentQuestion
    ? selectedByQuestion[currentQuestion._id]
    : undefined

  const totalQuestions = questions?.length ?? 0
  const progress = totalQuestions > 0 ? (currentIndex + 1) / totalQuestions : 0
  const canContinue = Boolean(currentQuestion && currentSelection && !isSaving && !isSkipping)
  const canGoBack = currentIndex > 0

  const handleSelect = (optionKey: OptionKey) => {
    if (!currentQuestion) return
    setSelectedByQuestion((prev) => ({ ...prev, [currentQuestion._id]: optionKey }))
  }

  const handleContinue = async () => {
    if (!currentQuestion || !currentSelection || !questions) return

    setIsSaving(true)
    try {
      await saveResponse({
        questionId: currentQuestion._id,
        selectedOption: currentSelection,
      })

      if (currentIndex >= questions.length - 1) {
        await finalizeOnboarding({})
        router.replace("/onboarding/impact-score")
        return
      }
      setCurrentIndex((prev) => prev + 1)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = async () => {
    setIsSkipping(true)
    try {
      await skipOnboarding({})
      router.replace("/dashboard")
    } finally {
      setIsSkipping(false)
    }
  }

  if (userLoading || status === undefined || questions === undefined) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-foreground dark:border-neutral-600" />
      </div>
    )
  }

  if (!clerkUser || role !== "tenant" || !currentQuestion || totalQuestions === 0) {
    return null
  }

  return (
    <main className="flex min-h-[100dvh] w-full flex-col md:min-h-[calc(100vh-4rem)]">
      <div className="flex w-full items-center gap-3 px-4 pb-4 pt-5 sm:px-6 lg:gap-4 lg:px-10">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-xl leading-none disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            if (!canGoBack) return
            setCurrentIndex((prev) => Math.max(0, prev - 1))
          }}
          disabled={!canGoBack}
          aria-label="Go back"
        >
          ←
        </button>
        <div className="h-2.5 min-w-0 flex-1 rounded-full bg-accent lg:h-3">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(2, progress * 100)}%` }}
          />
        </div>
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSaving || isSkipping}
          className="hidden shrink-0 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50 lg:inline"
        >
          Skip for now
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 sm:px-6 lg:mx-0 lg:max-w-6xl lg:px-10">
      <p className="text-sm font-semibold tracking-[0.2em] text-primary">
        QUESTION {currentIndex + 1} OF {totalQuestions}
      </p>
      <h1 className="mt-3 font-heading text-4xl leading-tight text-foreground lg:text-5xl lg:whitespace-pre-wrap">
        {currentQuestion.title}
      </h1>
      {currentQuestion.description ? (
        <p className="mt-3 text-xl text-muted-foreground lg:max-w-2xl">{currentQuestion.description}</p>
      ) : null}

      <div className="mt-8 flex w-full max-w-md flex-1 flex-col lg:max-w-6xl">
        <div className="flex w-full flex-col gap-3">
        {optionOrder.map((optionKey) => {
          const isSelected = currentSelection === optionKey
          const label = currentQuestion[optionKey]
          return (
            <button
              key={optionKey}
              type="button"
              onClick={() => handleSelect(optionKey)}
              className={[
                "flex min-h-16 items-center gap-3 rounded-2xl border px-4 text-left text-xl transition",
                isSelected
                  ? "border-cream-border bg-cream-surface text-ink-warm"
                  : "border-border bg-background text-foreground",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-7 w-7 items-center justify-center rounded-full border",
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background",
                ].join(" ")}
              >
                {isSelected ? "✓" : ""}
              </span>
              <span>{label}</span>
            </button>
          )
        })}
        </div>

        <div className="flex w-full flex-col gap-4 pt-8">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="h-14 w-full rounded-2xl border border-cream-border bg-cream-surface px-6 text-lg font-semibold text-ink-warm hover:bg-cream-surface-soft disabled:border-border disabled:bg-muted disabled:text-muted-foreground lg:h-16 lg:text-xl"
          >
            {currentIndex >= totalQuestions - 1 ? "See My Impact Score" : "Continue"}
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSaving || isSkipping}
            className="text-center text-sm font-medium text-muted-foreground underline underline-offset-4 disabled:opacity-50 lg:hidden"
          >
            Skip for now
          </button>
        </div>
      </div>
      </div>
    </main>
  )
}
