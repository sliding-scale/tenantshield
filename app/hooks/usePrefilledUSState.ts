"use client"

import { useEffect, useRef, useState } from "react"
import useCurrentUser from "@/app/hooks/useCurrentUser"
import {
  normalizeUserStateAbbr,
  US_STATE_NAMES,
  type USStateAbbr,
} from "@/lib/constants/us-states"

/**
 * State chip selection for create flows. Prefers URL ?state=, then the user's saved state in Convex.
 */
export function usePrefilledUSState(urlStateParam?: string | null) {
  const { convexUser, isLoading } = useCurrentUser()
  const [state, setState] = useState("")
  const didApplyDefault = useRef(false)

  useEffect(() => {
    if (didApplyDefault.current) return

    const fromUrl = urlStateParam?.trim().toUpperCase() ?? ""
    if (fromUrl && fromUrl in US_STATE_NAMES) {
      setState(fromUrl)
      didApplyDefault.current = true
      return
    }

    if (isLoading || convexUser === undefined) return

    const fromProfile = normalizeUserStateAbbr(convexUser?.state)
    if (fromProfile) setState(fromProfile)
    didApplyDefault.current = true
  }, [convexUser, convexUser?.state, isLoading, urlStateParam])

  return {
    state,
    setState,
    stateAbbr: state as USStateAbbr | "",
    isProfileStateLoading: isLoading || convexUser === undefined,
  }
}
