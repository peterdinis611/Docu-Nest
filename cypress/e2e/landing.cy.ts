import { setupClerkTestingToken } from "@clerk/testing/cypress"

const protectedRoutes = [
  { path: "/app", label: "dashboard" },
  { path: "/app/library", label: "library" },
  { path: "/app/analytics", label: "analytics" },
  { path: "/app/settings", label: "settings" },
  { path: "/notebook/nonexistent-id", label: "notebook workspace" },
]

describe("Landing page", () => {
  beforeEach(() => {
    setupClerkTestingToken()
  })

  it("shows the DocuNest sign-in screen", () => {
    cy.visit("/")

    cy.title().should("include", "DocuNest")
    cy.contains("h1", "DocuNest").should("be.visible")
    cy.contains("Sign in to access your notebooks and documents").should(
      "be.visible"
    )
    cy.get(".cl-signIn-root").should("exist")
  })

  it("shows the Clerk sign-in form fields", () => {
    cy.visit("/")

    cy.get(".cl-signIn-root").within(() => {
      cy.get('input[name="identifier"]').should("be.visible")
    })
  })

  it("offers account creation from the sign-in screen", () => {
    cy.visit("/")

    cy.get(".cl-signIn-root").within(() => {
      cy.contains("a", "Sign up").should("be.visible")
    })
  })

  it("shows the theme toggle on the landing page", () => {
    cy.visit("/")

    cy.get(".absolute.right-4.top-4 button").click()
    cy.contains('[role="menuitem"]', "Dark").click()
    cy.get("html").should("have.class", "dark")
  })

  it("renders correctly on mobile viewports", () => {
    cy.viewport("iphone-x")
    cy.visit("/")

    cy.contains("h1", "DocuNest").should("be.visible")
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
  beforeEach(() => {
    setupClerkTestingToken()
  })

  it("blocks unauthenticated access to the dashboard", () => {
    cy.visit("/app", { failOnStatusCode: false })
    cy.contains("button", "New notebook").should("not.exist")
  })

  protectedRoutes.forEach(({ path, label }) => {
    it(`blocks unauthenticated access to ${label}`, () => {
      cy.visit(path, { failOnStatusCode: false })

      cy.contains("button", "New notebook").should("not.exist")
      cy.get('[aria-label="Toggle sources panel"]').should("not.exist")
      cy.get(".cl-signIn-root").should("exist")
    })
  })

  it("keeps unauthenticated users on public routes", () => {
    cy.visit("/")
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`)
    cy.contains("h1", "DocuNest").should("be.visible")
  })
})
