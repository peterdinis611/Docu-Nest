describe("Notebook creation", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app")
  })

  it("creates a notebook and opens the workspace", () => {
    cy.uniqueTestName("E2E Notebook").then((title) => {
      cy.createNotebook(title, "Created by Cypress E2E test")
      cy.contains("button", title).should("be.visible")
      cy.get('[aria-label="Toggle sources panel"]').should("be.visible")
      cy.get('[aria-label="Toggle studio panel"]').should("be.visible")
    })
  })

  it("cancels notebook creation without leaving the dashboard", () => {
    cy.contains("button", "New notebook").click()

    cy.get('[role="dialog"]').within(() => {
      cy.get("#notebook-title").type("Should Not Be Created")
      cy.contains("button", "Cancel").click()
    })

    cy.get('[role="dialog"]').should("not.exist")
    cy.url().should("match", /\/app\/?$/)
  })
})
