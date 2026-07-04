describe("Appearance settings", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app/settings")
  })

  it("shows theme controls on the profile section", () => {
    cy.contains("Appearance").should("be.visible")
    cy.contains("button", "Light").should("be.visible")
    cy.contains("button", "Dark").should("be.visible")
    cy.contains("button", "System").should("be.visible")
  })

  it("switches theme preference", () => {
    cy.contains("button", "Dark").click()
    cy.contains("Active:").should("contain.text", "Dark")
    cy.get("html").should("have.class", "dark")

    cy.contains("button", "Light").click()
    cy.contains("Active:").should("contain.text", "Light")
    cy.get("html").should("not.have.class", "dark")
  })
})

describe("Data settings", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app/settings")
  })

  it("shows workspace usage stats", () => {
    cy.contains("button", "Data").click()
    cy.contains("Your data").should("be.visible")
    cy.contains("Notebooks").should("be.visible")
    cy.contains("Sources").should("be.visible")
    cy.contains("Chat messages").should("be.visible")
  })

  it("shows destructive data actions", () => {
    cy.contains("button", "Data").click()
    cy.contains("Delete all").should("be.visible")
    cy.contains("button", "Sign out").should("be.visible")
  })
})
