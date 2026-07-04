"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { motionTransition, transitions } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionTransition(transitions.smooth, reducedMotion)}
      className={cn("will-change-[opacity,transform]", className)}
    >
      {children}
    </motion.div>
  )
}
