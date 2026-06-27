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
