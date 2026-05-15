/**
 * Layout tokens for pages rendered above the fixed mobile tab bar.
 * Keep height in sync with `TabBarSpacer` in `components/shared/mobile-tab-bar.tsx`.
 */
export const MOBILE_TAB_BAR_HEIGHT =
  "calc(3.75rem + env(safe-area-inset-bottom, 0px))"

/** Bottom padding so content clears the tab bar on small screens (md+ unchanged). */
export const MOBILE_TAB_BAR_PAGE_PADDING = "max-md:pb-24"
