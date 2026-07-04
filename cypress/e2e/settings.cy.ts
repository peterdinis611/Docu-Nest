describe("Settings", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app/settings")
  })

  it("shows profile and data sections", () => {
    cy.contains("h1", "Settings").should("be.visible")
    cy.contains("button", "Profile").should("be.visible")
    cy.contains("button", "Data").should("be.visible")
  })

  it("switches between settings sections", () => {
    cy.contains("button", "Data").click()
    cy.contains("h2", "Data").should("be.visible")

    cy.contains("button", "Profile").click()
    cy.contains("h2", "Profile").should("be.visible")
  })
})
