import { create, all } from "mathjs"

/** Configured math.js instance for safe numeric operations across the app. */
export const math = create(all, {
  number: "number",
  precision: 14,
})

export function clamp(value: number, min: number, max: number) {
  return math.min(math.max(value, min), max) as number
}

export function roundTo(value: number, decimals = 0) {
  return math.round(value, decimals) as number
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return roundTo(
    math.multiply(math.divide(math.subtract(current, previous), previous), 100),
    1
  )
}

export function percentOf(value: number, total: number) {
  if (total === 0) return 0
  return roundTo(math.multiply(math.divide(value, total), 100), 0)
}

export function evaluateExpression(expression: string) {
  return math.evaluate(expression) as number
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleRadians: number
) {
  return {
    x: roundTo(math.add(centerX, math.multiply(radius, math.cos(angleRadians))), 2),
    y: roundTo(math.add(centerY, math.multiply(radius, math.sin(angleRadians))), 2),
  }
}
