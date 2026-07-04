"use client"

import { useReducedMotion } from "framer-motion"
import { motionTransition } from "@/lib/motion"
import type { Transition } from "framer-motion"

export function useMotionSafe(defaultTransition: Transition): Transition {
  const reducedMotion = useReducedMotion()
  return motionTransition(defaultTransition, reducedMotion)
}

export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false
}
