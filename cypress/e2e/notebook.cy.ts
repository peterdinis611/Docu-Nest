describe("Notebook creation", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app")
  })

  it("creates a notebook and opens the workspace", () => {
    cy.uniqueTestName("E2E Notebook").then((title) => {
      cy.contains("button", "New notebook").click()

      cy.get('[role="dialog"]').within(() => {
        cy.get("#notebook-title").type(title)
        cy.get("#notebook-desc").type("Created by Cypress E2E test")
        cy.contains("button", "Create").click()
      })

      cy.url({ timeout: 15000 }).should("match", /\/notebook\/.+/)
      cy.contains("button", title).should("be.visible")
      cy.get('[aria-label="Toggle sources panel"]').should("be.visible")
      cy.get('[aria-label="Toggle studio panel"]').should("be.visible")
    })
  })
})
