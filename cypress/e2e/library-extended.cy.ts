describe("Library sorting and filters", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app/library")
  })

  it("opens the sort menu", () => {
    cy.contains("button", "Newest first").click()
    cy.contains("Title A → Z").click()
    cy.contains("button", "Title A → Z").should("be.visible")
  })

  it("opens the filter menu", () => {
    cy.contains("button", "Filter").click()
    cy.contains("Active only").click()
    cy.contains("button", "Filter").should("be.visible")
  })
})
