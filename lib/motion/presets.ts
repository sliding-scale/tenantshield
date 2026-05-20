import type { Transition, Variants } from "motion/react"

/** tw-animate-css class strings for simple enter animations (auth, dialogs). */
export const pageEnter =
  "animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both"

export const pageEnterItem = "animate-in fade-in-0 slide-in-from-bottom-2 duration-500 fill-mode-both"

/** Stagger delays for CSS-only field enter (no framer). */
export const fieldEnterDelays = ["delay-0", "delay-75", "delay-150", "delay-200", "delay-300"] as const

export const fadeTransition: Transition = { duration: 0.35, ease: "easeOut" }

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: fadeTransition,
  },
}

export const tapScale = { whileTap: { scale: 0.98 } } as const
