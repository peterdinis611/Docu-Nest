describe("Sidebar", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app")
  })

  it("shows brand and main navigation links", () => {
    cy.get("aside").within(() => {
      cy.contains("DocuNest").should("be.visible")
      cy.contains("a", "Home").should("be.visible")
      cy.contains("a", "Library").should("be.visible")
      cy.contains("a", "Analytics").should("be.visible")
      cy.contains("a", "Settings").should("be.visible")
    })
  })

  it("opens global search from the sidebar", () => {
    cy.openGlobalSearch()
    cy.get('input[placeholder*="Search notebooks"]').should("be.focused")
  })

  it("collapses and reopens the sidebar", () => {
    cy.get('[aria-label="Close sidebar"]').click()
    cy.get("aside").should("not.be.visible")

    cy.get('[aria-label="Open sidebar"]').click()
    cy.get("aside").contains("DocuNest").should("be.visible")
  })

  it("navigates home from the logo link", () => {
    cy.visit("/app/library")
    cy.get("aside").contains("DocuNest").click()
    cy.url().should("match", /\/app\/?$/)
  })

  it("shows the theme control in the sidebar footer", () => {
    cy.get("aside").contains("Theme").should("be.visible")
  })
})
