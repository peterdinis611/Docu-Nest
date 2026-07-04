"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { motionTransition, transitions } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface MotionIconBadgeProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function MotionIconBadge({
  children,
  className,
  delay = 0.05,
}: MotionIconBadgeProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={motionTransition(
        { ...transitions.spring, delay },
        reducedMotion
      )}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
