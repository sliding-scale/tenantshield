import { Suspense } from "react"
import CreatePropertyClient from "./create-property-client"

export default function CreatePropertyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] items-center justify-center bg-cream-page px-4">
          <p className="text-sm text-ink-warm-muted">Loading…</p>
        </main>
      }
    >
      <CreatePropertyClient />
    </Suspense>
  )
}
