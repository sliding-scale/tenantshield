"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreatePropertyForm } from "@/components/tenant/rating/create-property-form"

export default function CreatePropertyClient() {
  const searchParams = useSearchParams()
  const initialName = searchParams.get("name")?.trim() ?? ""

  return (
    <main className="min-h-[100dvh] bg-cream-page px-4 py-5 md:min-h-[calc(100vh-4rem)] md:px-8 md:py-8">
      <div className="mx-auto w-full min-w-0 max-w-2xl">
        <Button
          variant="outline"
          size="sm"
          className="mb-5 gap-1 rounded-full border-cream-border bg-background"
          asChild
        >
          <Link href="/ratings">
            <ChevronLeft className="size-4" />
            Back to ratings
          </Link>
        </Button>

        <header className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary md:text-xs">
            New property
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold leading-snug text-ink-warm md:text-3xl lg:text-[2rem]">
            Add a property
          </h1>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink-warm-muted">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
              <Shield className="size-4 shrink-0" strokeWidth={1.75} />
            </span>
            Upload a photo and name. You&apos;ll rate it on the next step.
          </p>
        </header>

        <CreatePropertyForm initialName={initialName} />
      </div>
    </main>
  )
}
