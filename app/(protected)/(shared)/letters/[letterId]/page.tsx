"use client"

import { useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { LetterResultView, type LetterData } from "@/components/tenant/write-letter/letter-result-view"
import {
  LetterTipTapEditor,
  type LetterTipTapEditorHandle,
} from "@/components/tenant/write-letter/letter-tiptap-editor"
import { Button } from "@/components/ui/button"
import { US_STATE_NAMES, type USStateAbbr } from "@/lib/constants/us-states"
import { shouldBlurFreeLetterPreview } from "@/lib/plans/plan-access"

export default function LetterDetailPage() {
  const params = useParams<{ letterId: string }>()
  const router = useRouter()
  const letterId = (params?.letterId ?? "") as Id<"letters">
  const row = useQuery(api.letters.queries.getByIdForCurrentUser, letterId ? { letterId } : "skip")
  const updateLetter = useMutation(api.letters.mutations.updateFullLetterTextForCurrentUser)

  const [didCopy, setDidCopy] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const editorRef = useRef<LetterTipTapEditorHandle>(null)

  const stateName = useMemo(() => {
    if (!row) return ""
    const abbr = row.inputData.state
    return abbr && abbr in US_STATE_NAMES ? US_STATE_NAMES[abbr as USStateAbbr] : abbr
  }, [row])

  const onCopy = async () => {
    if (!row) return
    const text = isEditing ? editorRef.current?.getPlainText() ?? "" : row.fullLetterText
    setDidCopy(false)
    try {
      await navigator.clipboard.writeText(text)
      setDidCopy(true)
      setTimeout(() => setDidCopy(false), 1800)
      return
    } catch {
      try {
        const el = document.createElement("textarea")
        el.value = text
        el.setAttribute("readonly", "true")
        el.style.position = "fixed"
        el.style.left = "-9999px"
        document.body.appendChild(el)
        el.select()
        const ok = document.execCommand("copy")
        document.body.removeChild(el)
        setDidCopy(ok)
        if (ok) setTimeout(() => setDidCopy(false), 1800)
      } catch {
        setDidCopy(false)
      }
    }
  }

  const handleSave = async () => {
    if (!row) return
    const text = editorRef.current?.getPlainText() ?? ""
    setSaveError(null)
    setIsSaving(true)
    try {
      await updateLetter({ letterId, fullLetterText: text })
      setIsEditing(false)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  if (!params?.letterId) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Invalid letter id.</p>
      </main>
    )
  }

  if (row === undefined) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <ShieldLoader variant="letter" fullPage />
      </main>
    )
  }

  if (!row) {
    return (
      <main className="min-h-[100dvh] bg-cream-page px-4 py-6 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-10">
        <p className="text-muted-foreground">Letter not found.</p>
      </main>
    )
  }

  const blurLetter = shouldBlurFreeLetterPreview(row.createdUnderPlan)

  return (
    <LetterResultView
      letterData={row.letterData as LetterData}
      createdUnderPlan={row.createdUnderPlan}
      letterType={row.inputData.letterType}
      stateName={stateName}
      landlordName={row.inputData.landlordName}
      didCopy={didCopy}
      letterBodyOverride={isEditing ? undefined : row.fullLetterText}
      heroTitle={isEditing ? "Edit your letter" : undefined}
      heroSubtitle={
        isEditing
          ? "Edit the body below, then save. Copy uses the editor text while you’re editing."
          : undefined
      }
      onEditLetter={isEditing || blurLetter ? undefined : () => setIsEditing(true)}
      letterContentSlot={
        isEditing ? (
          <LetterTipTapEditor
            key={row.fullLetterText}
            ref={editorRef}
            initialPlainText={row.fullLetterText}
          />
        ) : undefined
      }
      footerSlot={
        isEditing ? (
          <div className="space-y-3">
            {saveError ? <p className="text-center text-sm font-medium text-destructive">{saveError}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => {
                  setSaveError(null)
                  setIsEditing(false)
                }}
                className="h-12 rounded-2xl border-cream-border bg-background sm:h-14 sm:min-w-[7.5rem]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={() => void handleSave()}
                className="h-12 rounded-2xl bg-surface-strong px-6 text-base font-semibold text-white hover:bg-surface-strong-hover sm:h-14 sm:flex-1 sm:max-w-xs"
              >
                {isSaving ? "Saving…" : "Save letter"}
              </Button>
            </div>
          </div>
        ) : undefined
      }
      onBack={() => router.push("/letters")}
      onCopy={() => void onCopy()}
      headerBeforeCopy={
        <Button
          size="sm"
          className="h-10 max-w-[10.5rem] truncate rounded-xl border-0 bg-surface-strong px-3 text-xs font-semibold text-white shadow-sm hover:bg-surface-strong-hover sm:max-w-none sm:px-4 sm:text-sm"
          asChild
        >
          <Link href="/ratings">Rate your experience</Link>
        </Button>
      }
    />
  )
}
