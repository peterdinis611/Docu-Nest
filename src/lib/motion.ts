import type { Transition, Variants } from "framer-motion"

export const easing = {
  smooth: [0.16, 1, 0.3, 1] as const,
  standard: [0.4, 0, 0.2, 1] as const,
  out: [0, 0, 0.2, 1] as const,
}

export const duration = {
  fast: 0.15,
  normal: 0.22,
  slow: 0.32,
}

export const transitions = {
  smooth: {
    duration: duration.normal,
    ease: easing.smooth,
  } satisfies Transition,
  fast: {
    duration: duration.fast,
    ease: easing.out,
  } satisfies Transition,
  spring: {
    type: "spring",
    stiffness: 380,
    damping: 28,
  } satisfies Transition,
  springSoft: {
    type: "spring",
    stiffness: 260,
    damping: 24,
  } satisfies Transition,
}

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
}

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
}

export const pop: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
}

export type MotionPreset =
  | "fade"
  | "fadeUp"
  | "fadeDown"
  | "scaleIn"
  | "slideInLeft"
  | "slideInRight"
  | "pop"

export const presetVariants: Record<MotionPreset, Variants> = {
  fade,
  fadeUp,
  fadeDown,
  scaleIn,
  slideInLeft,
  slideInRight,
  pop,
}

export function motionTransition(
  transition: Transition,
  reducedMotion: boolean | null
): Transition {
  if (reducedMotion) {
    return { duration: 0 }
  }

  return transition
}

export function motionVariants(
  variants: Variants,
  reducedMotion: boolean | null
): Variants {
  if (!reducedMotion) {
    return variants
  }

  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }
}
