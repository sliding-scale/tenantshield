import { ShieldLoader } from "@/components/shared/shield-loader"

/** Instant feedback while navigating between protected routes (RSC streaming). */
export default function ProtectedLoading() {
  return <ShieldLoader variant="route" fullPage />
}
