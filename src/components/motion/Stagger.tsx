"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  motionTransition,
  motionVariants,
  staggerContainer,
  staggerItem,
  transitions,
} from "@/lib/motion"
import { cn } from "@/lib/utils"

interface StaggerProps {
  children: ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
}

export function Stagger({
  children,
  className,
  stagger = 0.06,
  delayChildren = 0.04,
}: StaggerProps) {
  const reducedMotion = useReducedMotion()
  const variants = motionVariants(staggerContainer, reducedMotion)

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        ...variants,
        animate: reducedMotion
          ? { transition: { duration: 0 } }
          : {
              transition: {
                staggerChildren: stagger,
                delayChildren,
              },
            },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reducedMotion = useReducedMotion()
  const variants = motionVariants(staggerItem, reducedMotion)

  return (
    <motion.div
      variants={variants}
      transition={motionTransition(transitions.smooth, reducedMotion)}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
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
