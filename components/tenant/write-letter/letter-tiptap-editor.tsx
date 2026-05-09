"use client"

import { forwardRef, useImperativeHandle } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import type { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function plainLetterTextToTiptapHtml(text: string): string {
  const blocks = text.split(/\n\n+/).map((b) => b.trim())
  if (blocks.length === 0 || (blocks.length === 1 && !blocks[0])) {
    return "<p></p>"
  }
  return blocks
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("")
}

export function tiptapDocToPlainLetter(editor: Editor): string {
  const parts: string[] = []
  editor.state.doc.forEach((child) => {
    if (child.type.name === "paragraph") {
      parts.push(child.textBetween(0, child.content.size, "\n"))
    }
  })
  return parts.join("\n\n").trimEnd()
}

export type LetterTipTapEditorHandle = {
  getPlainText: () => string
}

type LetterTipTapEditorProps = {
  initialPlainText: string
  className?: string
}

export const LetterTipTapEditor = forwardRef<LetterTipTapEditorHandle, LetterTipTapEditorProps>(
  function LetterTipTapEditor({ initialPlainText, className }, ref) {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
          bulletList: false,
          orderedList: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
        }),
        Placeholder.configure({ placeholder: "Edit your letter…" }),
      ],
      content: plainLetterTextToTiptapHtml(initialPlainText),
      editorProps: {
        attributes: {
          class: [
            "min-h-[min(24rem,50dvh)] w-full max-w-none rounded-xl px-3 py-3 text-base leading-relaxed text-foreground",
            "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "[&_p]:mb-3 [&_p:last-child]:mb-0",
            className ?? "",
          ].join(" "),
        },
      },
    })

    useImperativeHandle(
      ref,
      () => ({
        getPlainText: () => (editor ? tiptapDocToPlainLetter(editor) : ""),
      }),
      [editor],
    )

    if (!editor) {
      return (
        <div className="min-h-[min(24rem,50dvh)] animate-pulse rounded-xl border border-border bg-muted/30" />
      )
    }

    return <EditorContent editor={editor} />
  },
)
