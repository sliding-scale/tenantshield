"use client"

import { useId, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ImagePlus, Star, X } from "lucide-react"
import { ShieldLoader } from "@/components/shared/shield-loader"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

type Props = {
  initialName?: string
}

export function CreatePropertyForm({ initialName = "" }: Props) {
  const router = useRouter()
  const nameId = useId()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const generateUploadUrl = useMutation(api.properties.mutations.generateUploadUrl)
  const createProperty = useMutation(api.properties.mutations.create)

  const [name, setName] = useState(initialName)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const trimmedName = name.trim()
  const canSubmit = trimmedName.length >= 2 && !!file && !isSubmitting

  const handleSelectFile = (selected: File | null) => {
    setError(null)
    if (!selected) {
      setFile(null)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setError("Use a JPG, PNG, or WEBP image.")
      return
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setError("Image is larger than 5 MB.")
      return
    }
    setFile(selected)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(selected)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !file) return
    setIsSubmitting(true)
    setError(null)

    try {
      const uploadUrl = await generateUploadUrl({})
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!uploadRes.ok) {
        throw new Error("Image upload failed")
      }
      const { storageId } = (await uploadRes.json()) as { storageId: string }

      const propertyId = await createProperty({
        name: trimmedName,
        imageStorageId: storageId as never,
      })

      router.replace(`/ratings/give?propertyId=${encodeURIComponent(propertyId)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
      <Card className="gap-0 rounded-3xl border border-border py-0 shadow-none ring-0">
        <div className="space-y-5 p-4 sm:p-5 md:p-6">
          <div>
            <Label htmlFor={nameId} className="text-sm font-medium text-foreground">
              Property name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 1240 Oak Street, Apt 3B"
              maxLength={120}
              className="mt-1.5 h-11 rounded-xl border-border bg-background"
              required
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Include the unit / suite so other tenants can find it.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">
              Property image <span className="text-destructive">*</span>
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => handleSelectFile(e.target.files?.[0] ?? null)}
            />

            {previewUrl ? (
              <div className="relative mt-2 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative h-48 w-full sm:h-56">
                  <Image
                    src={previewUrl}
                    alt="Selected property"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border bg-background px-3 py-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {file?.name ?? "Image selected"}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-border"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={() => handleSelectFile(null)}
                    >
                      <X className="size-4" aria-hidden />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card text-center transition hover:border-primary/50 hover:bg-accent sm:h-52"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-foreground">
                  <ImagePlus className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-foreground">Click to upload a photo</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, or WEBP · up to 5 MB</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variant="cta"
          disabled={!canSubmit}
          className="h-12 w-full rounded-xl text-base font-semibold sm:h-14 sm:text-lg"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <ShieldLoader variant="ratings" compact />
              Creating…
            </span>
          ) : (
            <>
              <Star className="size-4 fill-primary text-primary" strokeWidth={0} aria-hidden />
              Create &amp; rate now
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          You&apos;ll be taken to the rating form right after the property is created.
        </p>
      </div>
    </form>
  )
}
