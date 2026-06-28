import type { Metadata } from "next"
import { Suspense } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Providers } from "@/components/providers"
import { clerkAppearance } from "@/lib/clerk-appearance"
import "./globals.css"

export const metadata: Metadata = {
  title: "DocuNest",
  description: "AI-powered document notebooks",
}

const themeInitScript = `(function(){try{var s=localStorage.getItem("docunest-theme");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body>
          <Providers>
            <Suspense fallback={null}>{children}</Suspense>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
