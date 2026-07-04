import { setupClerkTestingToken } from "@clerk/testing/cypress"

describe("Landing page", () => {
  beforeEach(() => {
    setupClerkTestingToken()
  })

  it("shows the DocuNest sign-in screen", () => {
    cy.visit("/")

    cy.contains("h1", "DocuNest").should("be.visible")
    cy.contains("Sign in to access your notebooks and documents").should(
      "be.visible"
    )
    cy.get(".cl-signIn-root").should("exist")
  })

  it("redirects signed-in users away from the landing page", () => {
    cy.hasTestCredentials().then((configured) => {
      if (!configured) {
        cy.log("Skipping — set CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD")
        return
      }

      cy.signInTestUser()
      cy.visit("/")
      cy.url().should("include", "/app")
    })
  })
})

describe("Auth protection", () => {
  it("blocks unauthenticated access to the dashboard", () => {
    setupClerkTestingToken()
    cy.visit("/app", { failOnStatusCode: false })
    cy.contains("button", "New notebook").should("not.exist")
  })
})
