"use client"

import { motion, type HTMLMotionProps } from "motion/react"
import { staggerContainer, staggerItem } from "@/lib/motion/presets"
import { cn } from "@/lib/utils"

type FadeInProps = HTMLMotionProps<"div"> & {
  /** When true, expects a parent `FadeInStagger` and uses staggerItem variants. */
  stagger?: boolean
}

export function FadeIn({ className, stagger, initial, animate, transition, ...props }: FadeInProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={stagger ? staggerItem : undefined}
      initial={stagger ? undefined : (initial ?? { opacity: 0, y: 8 })}
      animate={stagger ? undefined : (animate ?? { opacity: 1, y: 0 })}
      transition={stagger ? undefined : (transition ?? { duration: 0.35, ease: "easeOut" })}
      {...props}
    />
  )
}

export function FadeInStagger({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(className)}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      {...props}
    />
  )
}
