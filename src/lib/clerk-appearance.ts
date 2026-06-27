import { shadcn } from "@clerk/themes"

export const clerkAppearance = {
  theme: shadcn,
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "rounded-2xl shadow-xl shadow-black/[0.06]",
    formButtonPrimary: "shadow-md shadow-primary/20",
  },
}
