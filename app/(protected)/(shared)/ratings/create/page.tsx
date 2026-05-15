import { Suspense } from "react"
import { ShieldLoader } from "@/components/shared/shield-loader"
import CreatePropertyClient from "./create-property-client"

export default function CreatePropertyPage() {
  return (
    <Suspense
      fallback={<ShieldLoader variant="ratings" fullPage />}
    >
      <CreatePropertyClient />
    </Suspense>
  )
}
