"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignIn, useAuth } from "@clerk/nextjs"
import { Sparkles } from "lucide-react"
import { FadeIn, ScaleIn, Spinner, Stagger, StaggerItem } from "@/components/motion"
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
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <FadeIn
        preset="fadeDown"
        className="absolute right-4 top-4 z-20"
        duration={0.18}
      >
        <ThemeToggle />
      </FadeIn>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.06] via-transparent to-transparent" />

      <Stagger className="relative w-full max-w-md space-y-8">
        <StaggerItem className="space-y-2 text-center">
          <ScaleIn className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Sparkles className="size-6 text-primary-foreground" />
          </ScaleIn>
          <h1 className="text-2xl font-bold tracking-tight">DocuNest</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your notebooks and documents
          </p>
        </StaggerItem>

        <StaggerItem>
          <FadeIn preset="scaleIn" delay={0.1}>
            <SignIn
              routing="hash"
              forceRedirectUrl="/app"
              signUpForceRedirectUrl="/app"
            />
          </FadeIn>
        </StaggerItem>
      </Stagger>
    </div>
  )
}
