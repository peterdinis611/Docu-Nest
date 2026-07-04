"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  motionTransition,
  motionVariants,
  presetVariants,
  transitions,
  type MotionPreset,
} from "@/lib/motion"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: ReactNode
  className?: string
  preset?: MotionPreset
  delay?: number
  duration?: number
  as?: "div" | "section" | "article" | "span"
}

export function FadeIn({
  children,
  className,
  preset = "fadeUp",
  delay = 0,
  duration,
  as = "div",
}: FadeInProps) {
  const reducedMotion = useReducedMotion()
  const Component = motion[as]
  const variants = motionVariants(presetVariants[preset], reducedMotion)

  return (
    <Component
      initial="initial"
      animate="animate"
      variants={variants}
      transition={motionTransition(
        {
          ...transitions.smooth,
          delay,
          ...(duration !== undefined ? { duration } : {}),
        },
        reducedMotion
      )}
      className={className}
    >
      {children}
    </Component>
  )
}
