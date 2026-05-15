import { Suspense } from "react"
import { ShieldLoader } from "@/components/shared/shield-loader"
import GiveRatingClient from "./give-rating-client"

export default function GiveRatingPage() {
  return (
    <Suspense
      fallback={<ShieldLoader variant="ratings" fullPage />}
    >
      <GiveRatingClient />
    </Suspense>
  )
}
