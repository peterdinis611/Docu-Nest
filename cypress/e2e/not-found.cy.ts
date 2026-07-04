describe("Not found pages", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
  })

  it("shows app 404 inside the workspace shell", () => {
    cy.visit("/app/this-page-does-not-exist", { failOnStatusCode: false })
    cy.contains("h1", "Page not found").should("be.visible")
    cy.contains("a", "Back to home").should("be.visible")
    cy.get("aside").should("be.visible")
  })

  it("shows notebook 404 for unknown notebook ids", () => {
    cy.visit("/notebook/nonexistent-notebook-id", { failOnStatusCode: false })
    cy.contains("h1", "Notebook not found").should("be.visible")
    cy.contains("a", "All notebooks").should("be.visible")
  })
})

describe("Public not found", () => {
  it("shows root 404 for unknown routes", () => {
    cy.visit("/unknown-public-route", { failOnStatusCode: false })
    cy.contains("h1", "Page not found").should("be.visible")
    cy.contains("a", "Go to sign in").should("be.visible")
  })
})
