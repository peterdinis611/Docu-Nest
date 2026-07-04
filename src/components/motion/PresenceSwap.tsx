"use client"

import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  motionTransition,
  motionVariants,
  presetVariants,
  transitions,
  type MotionPreset,
} from "@/lib/motion"
import { cn } from "@/lib/utils"

interface PresenceSwapProps {
  presentKey: string | number
  children: ReactNode
  className?: string
  preset?: MotionPreset
  mode?: "wait" | "sync" | "popLayout"
  initial?: boolean
}

export function PresenceSwap({
  presentKey,
  children,
  className,
  preset = "fadeUp",
  mode = "wait",
  initial = false,
}: PresenceSwapProps) {
  const reducedMotion = useReducedMotion()
  const variants = motionVariants(presetVariants[preset], reducedMotion)

  return (
    <AnimatePresence mode={mode} initial={initial}>
      <motion.div
        key={presentKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={motionTransition(transitions.smooth, reducedMotion)}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
