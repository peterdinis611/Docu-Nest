describe("App navigation", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
  })

  it("loads the home dashboard", () => {
    cy.visit("/app")

    cy.get("h1").should("be.visible")
    cy.contains("button", "New notebook").should("be.visible")
  })

  it("navigates between main app pages from the sidebar", () => {
    cy.visit("/app")

    cy.get("aside").contains("a", "Library").click()
    cy.url().should("include", "/app/library")
    cy.contains("h1", "Library").should("be.visible")

    cy.get("aside").contains("a", "Analytics").click()
    cy.url().should("include", "/app/analytics")
    cy.contains("h1", "Analytics").should("be.visible")

    cy.get("aside").contains("a", "Settings").click()
    cy.url().should("include", "/app/settings")
    cy.contains("h1", "Settings").should("be.visible")

    cy.get("aside").contains("a", "Home").click()
    cy.url().should("match", /\/app\/?$/)
  })
})
