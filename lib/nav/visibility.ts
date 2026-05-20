/** Shared rules for chrome (navbar / mobile tab bar) visibility. */

export function isAuthPagePath(pathname: string | null) {
  if (!pathname) return false
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/sso-callback" ||
    pathname.startsWith("/sso-callback/")
  )
}

export function isVerifyEmailPath(pathname: string | null) {
  if (!pathname) return false
  return pathname === "/verify-email" || pathname.startsWith("/verify-email/")
}

/** Full-screen onboarding steps only — not /onboarding/impact-score. */
export function isOnboardingQuestionFlowPath(pathname: string | null) {
  if (!pathname) return false
  return pathname === "/onboarding" || pathname === "/onboarding/"
}

export function isSharedPagePath(pathname: string | null) {
  if (!pathname) return false
  const p = pathname.toLowerCase()
  return (
    p.startsWith("/ask-ai") ||
    p.startsWith("/analyze-lease") ||
    p.startsWith("/letters/") ||
    p.startsWith("/cases/") ||
    p.startsWith("/leases/")
  )
}

export function shouldShowMobileTabBar(pathname: string | null, isSignedIn: boolean) {
  if (!isSignedIn || !pathname) return false
  if (isAuthPagePath(pathname)) return false
  if (isVerifyEmailPath(pathname)) return false
  if (isOnboardingQuestionFlowPath(pathname)) return false
  if (isSharedPagePath(pathname)) return false
  return true
}

/** Signed-in mobile uses bottom tab bar / page chrome — no top navbar on any route. */
export function shouldHideTopNavbarOnMobile(pathname: string | null, isSignedIn: boolean) {
  if (!isSignedIn || !pathname) return false
  if (isAuthPagePath(pathname)) return false
  if (isVerifyEmailPath(pathname)) return false
  return true
}

/** Desktop sidebar for signed-in app routes (replaces top navbar links). */
export function shouldShowDesktopSidebar(pathname: string | null, isSignedIn: boolean) {
  if (!isSignedIn || !pathname) return false
  if (isAuthPagePath(pathname)) return false
  if (isVerifyEmailPath(pathname)) return false
  if (isOnboardingQuestionFlowPath(pathname)) return false
  return true
}
