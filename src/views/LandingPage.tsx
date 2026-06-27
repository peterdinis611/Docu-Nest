"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignIn, useAuth } from "@clerk/nextjs"
import { Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function LandingPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/app")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.06] via-transparent to-transparent" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DocuNest</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your notebooks and documents
          </p>
        </div>

        <SignIn
          routing="hash"
          forceRedirectUrl="/app"
          signUpForceRedirectUrl="/app"
        />
      </div>
    </div>
  )
}
