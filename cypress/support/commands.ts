declare global {
  namespace Cypress {
    interface Chainable {
      signInTestUser(): Chainable<void>
      hasTestCredentials(): Chainable<boolean>
    }
  }
}

function hasTestCredentials(): boolean {
  return Boolean(Cypress.env("testEmail") && Cypress.env("testPassword"))
}

Cypress.Commands.add("hasTestCredentials", () => {
  return cy.wrap(hasTestCredentials())
})

Cypress.Commands.add("signInTestUser", () => {
  if (!hasTestCredentials()) {
    throw new Error(
      "Set CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD in .env.local to run authenticated tests."
    )
  }

  cy.session(
    "clerk-test-user",
    () => {
      cy.visit("/")
      cy.clerkLoaded()
      cy.clerkSignIn({
        strategy: "password",
        identifier: Cypress.env("testEmail"),
        password: Cypress.env("testPassword"),
      })
    },
    {
      validate() {
        cy.visit("/app")
        cy.url().should("include", "/app")
      },
    }
  )
})

export {}
