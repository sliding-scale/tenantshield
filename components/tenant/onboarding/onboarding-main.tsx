"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { Check, ChevronLeft } from "lucide-react"
import { api } from "@/convex/_generated/api"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { StatePickerField } from "@/components/shared/state-picker-field"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type OptionKey = "option1" | "option2" | "option3" | "option4"

const optionOrder: OptionKey[] = ["option1", "option2", "option3", "option4"]

export default function OnboardingMain() {
  const router = useRouter()
  const { clerkUser, role, convexUser, isLoading: userLoading } = useCurrentUser()
  const status = useQuery(api.onboarding.queries.onboardingStatus, clerkUser ? {} : "skip")
  const questions = useQuery(
    api.onboarding.queries.questionsForCurrentUser,
    clerkUser ? {} : "skip",
  )
  const saveResponse = useMutation(api.onboarding.mutations.saveResponse)
  const finalizeOnboarding = useMutation(api.onboarding.mutations.finalizeOnboarding)
  const skipOnboarding = useMutation(api.onboarding.mutations.skip)
  const updateState = useMutation(api.users.mutations.updateState)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, OptionKey>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [stateGateDismissed, setStateGateDismissed] = useState(false)
  const [selectedState, setSelectedState] = useState("")
  const [isSavingState, setIsSavingState] = useState(false)
  const [stateGateError, setStateGateError] = useState<string | null>(null)
  const hasInitializedIndex = useRef(false)

  const needsStateGate = Boolean(
    convexUser && !convexUser.state?.trim() && !stateGateDismissed,
  )

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

  const handleStateContinue = async () => {
    if (!selectedState) {
      setStateGateError("Select your state to continue, or skip for now.")
      return
    }
    setStateGateError(null)
    setIsSavingState(true)
    try {
      await updateState({ state: selectedState })
      setStateGateDismissed(true)
    } catch (e) {
      console.error(e)
      setStateGateError("Could not save your state. Please try again.")
    } finally {
      setIsSavingState(false)
    }
  }

  const handleStateSkip = () => {
    setStateGateError(null)
    setStateGateDismissed(true)
  }

  if (userLoading || status === undefined || questions === undefined) {
    return <ShieldLoader variant="onboarding" fullPage className="min-h-[70vh]" />
  }

  if (!clerkUser || role !== "tenant") {
    return null
  }

  if (needsStateGate) {
    return (
      <main className="flex min-h-svh w-full flex-col bg-background">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-8 pt-8 sm:px-6 lg:px-8">
          <Card className="gap-0 rounded-3xl border border-border py-0 shadow-none ring-0">
            <div className="p-6 text-center sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Before we start
              </p>
              <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                Where are you renting?
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Pick your state so we can tailor laws, letters, and case guidance to your
                location. You can change this anytime in your profile.
              </p>

              <div className="mx-auto mt-8 flex w-full max-w-sm flex-col items-center gap-4">
                <StatePickerField
                  className="w-full"
                  showLabel={false}
                  state={selectedState}
                  onStateChange={(value) => {
                    setSelectedState(value)
                    setStateGateError(null)
                  }}
                />
                {stateGateError ? (
                  <p className="text-sm font-medium text-destructive">{stateGateError}</p>
                ) : null}

                <Button
                  type="button"
                  onClick={() => void handleStateContinue()}
                  disabled={isSavingState}
                  className="mt-2 h-12 w-full rounded-full text-base font-semibold sm:h-14"
                >
                  {isSavingState ? "Saving…" : "Continue"}
                </Button>
              </div>
            </div>
          </Card>
          <Button
            type="button"
            variant="ghost"
            onClick={handleStateSkip}
            disabled={isSavingState}
            className="mx-auto mt-4 h-auto py-2 text-sm font-medium text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </main>
    )
  }

  if (!currentQuestion || totalQuestions === 0) {
    return null
  }

  return (
    <main className="flex min-h-svh w-full flex-col bg-background">
      <div className="flex w-full items-center gap-3 px-4 pb-4 pt-5 sm:px-6 lg:gap-4 lg:px-10">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0 rounded-full"
          onClick={() => {
            if (!canGoBack) return
            setCurrentIndex((prev) => Math.max(0, prev - 1))
          }}
          disabled={!canGoBack}
          aria-label="Go back"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Button>
        <div className="h-2 min-w-0 flex-1 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(2, progress * 100)}%` }}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          disabled={isSaving || isSkipping}
          className="hidden shrink-0 text-sm font-medium text-muted-foreground lg:inline-flex"
        >
          Skip for now
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-6 sm:px-6 lg:max-w-2xl lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:whitespace-pre-wrap">
          {currentQuestion.title}
        </h1>
        {currentQuestion.description ? (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground lg:max-w-2xl">
            {currentQuestion.description}
          </p>
        ) : null}

        <div className="mt-8 flex w-full flex-1 flex-col">
          <div className="flex w-full flex-col gap-3">
            {optionOrder.map((optionKey) => {
              const isSelected = currentSelection === optionKey
              const label = currentQuestion[optionKey]
              return (
                <button
                  key={optionKey}
                  type="button"
                  onClick={() => handleSelect(optionKey)}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-base transition sm:min-h-16 sm:text-lg",
                    isSelected
                      ? "border-primary/30 bg-card text-foreground ring-1 ring-primary/20"
                      : "border-border bg-card text-foreground hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-7 shrink-0 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background",
                    )}
                  >
                    {isSelected ? <Check className="size-4" aria-hidden /> : null}
                  </span>
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex w-full flex-col gap-3 pt-8">
            <Button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="h-12 w-full rounded-2xl text-base font-semibold sm:h-14 sm:text-lg"
            >
              {currentIndex >= totalQuestions - 1 ? "See My Impact Score" : "Continue"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSaving || isSkipping}
              className="h-auto py-2 text-sm font-medium text-muted-foreground lg:hidden"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
