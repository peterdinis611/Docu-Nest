describe("Analytics", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app/analytics")
  })

  it("loads the analytics dashboard", () => {
    cy.contains("h1", "Analytics").should("be.visible")
    cy.contains("Usage insights across all notebooks").should("be.visible")
  })

  it("shows usage metric cards", () => {
    cy.contains("Questions asked").should("be.visible")
    cy.contains("Sources indexed").should("be.visible")
    cy.contains("Studio outputs").should("be.visible")
  })

  it("switches analytics tabs", () => {
    cy.contains('[role="tab"]', "Breakdown").click()
    cy.contains('[role="tab"]', "Breakdown").should(
      "have.attr",
      "data-state",
      "active"
    )

    cy.contains('[role="tab"]', "Trends").click()
    cy.contains('[role="tab"]', "Trends").should(
      "have.attr",
      "data-state",
      "active"
    )

    cy.contains('[role="tab"]', "Efficiency").click()
    cy.contains('[role="tab"]', "Efficiency").should(
      "have.attr",
      "data-state",
      "active"
    )
  })
})
