describe("Global search", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app")
  })

  it("opens from the sidebar", () => {
    cy.openGlobalSearch()
    cy.get('input[placeholder*="Search notebooks"]').should("be.visible")
    cy.contains("Search DocuNest").should("be.visible")
  })

  it("shows empty results for unknown queries", () => {
    cy.openGlobalSearch()
    cy.get('input[placeholder*="Search notebooks"]').type("zzzz-no-match-xyz")
    cy.contains("No matches found", { timeout: 10000 }).should("be.visible")
  })

  it("can navigate to a built-in page result", () => {
    cy.openGlobalSearch()
    cy.get('input[placeholder*="Search notebooks"]').type("Library")
    cy.get('[role="dialog"]')
      .contains("button", "Library")
      .click()
    cy.url().should("include", "/app/library")
  })

  it("closes with Escape", () => {
    cy.openGlobalSearch()
    cy.get("body").type("{esc}")
    cy.get('[role="dialog"]').should("not.exist")
  })
})
