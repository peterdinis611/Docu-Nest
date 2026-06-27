export const NOTEBOOK_COLORS = [
  "from-blue-500/20 to-indigo-500/10",
  "from-emerald-500/20 to-teal-500/10",
  "from-amber-500/20 to-orange-500/10",
  "from-violet-500/20 to-purple-500/10",
  "from-rose-500/20 to-pink-500/10",
  "from-cyan-500/20 to-sky-500/10",
] as const

export function pickNotebookColor() {
  return NOTEBOOK_COLORS[Math.floor(Math.random() * NOTEBOOK_COLORS.length)]
}

export function getNotebookDotClass(color: string) {
  if (color.includes("blue") || color.includes("indigo")) return "bg-blue-400"
  if (color.includes("emerald") || color.includes("teal")) return "bg-emerald-400"
  if (color.includes("amber") || color.includes("orange")) return "bg-amber-400"
  if (color.includes("violet") || color.includes("purple")) return "bg-violet-400"
  if (color.includes("rose") || color.includes("pink")) return "bg-rose-400"
  if (color.includes("cyan") || color.includes("sky")) return "bg-cyan-400"
  return "bg-sidebar-primary"
}
