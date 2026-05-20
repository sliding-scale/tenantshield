/**
 * Layout tokens for pages rendered above the fixed mobile tab bar.
 * Keep height in sync with `TabBarSpacer` in `components/shared/mobile-tab-bar.tsx`.
 */
export const MOBILE_TAB_BAR_HEIGHT =
  "calc(3.75rem + env(safe-area-inset-bottom, 0px))"

/** Bottom padding so content clears the tab bar on small screens (md+ unchanged). */
export const MOBILE_TAB_BAR_PAGE_PADDING = "max-md:pb-24"

/** Top inset when the mobile top navbar is hidden (notch / status bar). */
export const MOBILE_PAGE_TOP_PADDING =
  "max-md:pt-[max(1.25rem,env(safe-area-inset-top,0px))]"

/** Standard shell classes for pages with the fixed mobile tab bar. */
export const MOBILE_TAB_BAR_PAGE_SHELL = `${MOBILE_PAGE_TOP_PADDING} ${MOBILE_TAB_BAR_PAGE_PADDING}`

/**
 * Mobile viewport height — uses `svh` (small viewport) so layouts stay stable
 * when the browser chrome shows/hides (native app feel). Desktop uses classic `vh`.
 */
export const MOBILE_VIEWPORT_MIN_HEIGHT = "min-h-svh"
export const DESKTOP_VIEWPORT_MIN_HEIGHT = "md:min-h-[calc(100vh-4rem)]"
export const PAGE_MIN_HEIGHT = `${MOBILE_VIEWPORT_MIN_HEIGHT} ${DESKTOP_VIEWPORT_MIN_HEIGHT}`

/** Full-height app shells (e.g. Ask AI chat). */
export const MOBILE_VIEWPORT_HEIGHT = "h-svh max-h-svh"
export const DESKTOP_VIEWPORT_HEIGHT = "md:h-[calc(100vh-4rem)] md:max-h-[calc(100vh-4rem)]"
export const APP_SHELL_HEIGHT = `${MOBILE_VIEWPORT_HEIGHT} ${DESKTOP_VIEWPORT_HEIGHT}`
