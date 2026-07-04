import { clerkSetup } from "@clerk/testing/cypress"
import { defineConfig } from "cypress"
import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.local" })
loadEnv({ path: ".env" })

const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

if (publishableKey) {
  process.env.CLERK_PUBLISHABLE_KEY = publishableKey
}

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    setupNodeEvents(_on, config) {
      config.env.CLERK_PUBLISHABLE_KEY = publishableKey
      config.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY
      config.env.testEmail = process.env.CYPRESS_TEST_EMAIL
      config.env.testPassword = process.env.CYPRESS_TEST_PASSWORD

      return clerkSetup({ config })
    },
  },
})
