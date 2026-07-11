describe("Profile settings", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app/settings")
  })

  it("shows profile form fields", () => {
    cy.contains("Profile").should("be.visible")
    cy.get("#first-name").should("be.visible")
    cy.get("#last-name").should("be.visible")
    cy.get("#bio").should("be.visible")
  })

  it("disables save until profile fields change", () => {
    cy.contains("button", "Save changes").should("be.disabled")
  })

  it("shows the Clerk account manager action", () => {
    cy.contains("button", "Manage account & security").should("be.visible")
  })
})
