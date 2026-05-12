import { Suspense } from "react"
import GiveRatingClient from "./give-rating-client"

export default function GiveRatingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] items-center justify-center bg-cream-page px-4">
          <p className="text-sm text-ink-warm-muted">Loading…</p>
        </main>
      }
    >
      <GiveRatingClient />
    </Suspense>
  )
}
