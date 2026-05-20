/**
 * Layout tokens for pages rendered above the fixed mobile tab bar.
 * Keep height in sync with `TabBarSpacer` in `components/shared/mobile-tab-bar.tsx`.
 */
export const MOBILE_TAB_BAR_HEIGHT =
  "calc(3.75rem + env(safe-area-inset-bottom, 0px))"

/** Full-height Ask AI column on mobile (viewport minus fixed tab bar). */
export const MOBILE_ASK_AI_SHELL_HEIGHT_CLASS =
  "max-md:h-[calc(100svh-3.75rem-env(safe-area-inset-bottom,0px))] max-md:max-h-[calc(100svh-3.75rem-env(safe-area-inset-bottom,0px))] max-md:flex-none"

/** New case result — tab bar visible; bounded column above it. */
export const MOBILE_CASE_RESULT_SHELL_CLASS =
  "max-md:flex-none max-md:overflow-hidden max-md:h-[calc(100svh-3.75rem-env(safe-area-inset-bottom,0px))] max-md:max-h-[calc(100svh-3.75rem-env(safe-area-inset-bottom,0px))]"

/** Case detail (/cases/[id]) — no tab bar; full viewport column. */
export const MOBILE_CASE_DETAIL_SHELL_CLASS =
  "max-md:flex-none max-md:overflow-hidden max-md:h-svh max-md:max-h-svh"

/** Bottom padding so content clears the tab bar on small screens (md+ unchanged). */
export const MOBILE_TAB_BAR_PAGE_PADDING = "max-md:pb-24"

/** Top inset when the mobile top navbar is hidden (notch / status bar). */
export const MOBILE_PAGE_TOP_PADDING =
  "max-md:pt-[max(1.25rem,env(safe-area-inset-top,0px))]"

/** Standard shell classes for pages with the fixed mobile tab bar. */
export const MOBILE_TAB_BAR_PAGE_SHELL = `${MOBILE_PAGE_TOP_PADDING} ${MOBILE_TAB_BAR_PAGE_PADDING}`

/**
 * Mobile viewport height — uses `svh` (small viewport) so layouts stay stable
 * when the browser chrome shows/hides (native app feel). Desktop uses full `svh`
 * beside the sidebar (no top navbar).
 */
export const MOBILE_VIEWPORT_MIN_HEIGHT = "min-h-svh"
export const DESKTOP_VIEWPORT_MIN_HEIGHT = "md:min-h-svh"
export const PAGE_MIN_HEIGHT = `${MOBILE_VIEWPORT_MIN_HEIGHT} ${DESKTOP_VIEWPORT_MIN_HEIGHT}`

/** Full-height app shells (e.g. Ask AI chat). */
export const MOBILE_VIEWPORT_HEIGHT = "h-svh max-h-svh"
export const DESKTOP_VIEWPORT_HEIGHT = "md:h-svh md:max-h-svh"
export const APP_SHELL_HEIGHT = `${MOBILE_VIEWPORT_HEIGHT} ${DESKTOP_VIEWPORT_HEIGHT}`
