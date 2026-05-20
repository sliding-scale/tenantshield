"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { FadeIn } from "@/components/shared/fade-in"
import { CreatePropertyForm } from "@/components/tenant/rating/create-property-form"
import { Button } from "@/components/ui/button"
import { MOBILE_TAB_BAR_PAGE_SHELL } from "@/lib/nav/mobile-chrome"
import { cn } from "@/lib/utils"

export default function CreatePropertyClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialName = searchParams.get("name")?.trim() ?? ""

  return (
    <main
      className={cn(
        "min-h-svh bg-background px-4 md:min-h-svh md:px-8 md:py-10",
        MOBILE_TAB_BAR_PAGE_SHELL,
      )}
    >
      <div className="mx-auto w-full min-w-0 max-w-2xl">
        <header className="mb-6 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 md:mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/ratings")}
            className="h-11 w-11 rounded-full border-border bg-card p-0 text-foreground"
            aria-label="Back to ratings"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
          <p className="text-center text-base font-semibold text-foreground">New property</p>
          <span className="w-11 shrink-0" aria-hidden />
        </header>

        <FadeIn>
          <div className="mb-6 md:mb-8">
            <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
              Add a property
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Upload a photo and name. You&apos;ll rate it on the next step.
            </p>
          </div>

          <CreatePropertyForm initialName={initialName} />
        </FadeIn>
      </div>
    </main>
  )
}
