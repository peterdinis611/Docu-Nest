describe("Home dashboard", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app")
  })

  it("shows main dashboard sections", () => {
    cy.get("h1").should("be.visible")
    cy.contains("button", "New notebook").should("be.visible")
    cy.contains("h2", "Your notebooks").should("be.visible")
    cy.contains("h2", "Recent activity").should("be.visible")
  })

  it("opens the create notebook dialog", () => {
    cy.contains("button", "New notebook").click()
    cy.get('[role="dialog"]').within(() => {
      cy.contains("Create notebook").should("be.visible")
      cy.get("#notebook-title").should("be.visible")
      cy.get("#notebook-desc").should("be.visible")
      cy.contains("button", "Create").should("be.disabled")
    })
  })

  it("validates notebook title before create", () => {
    cy.contains("button", "New notebook").click()
    cy.get("#notebook-title").type(" ")
    cy.contains("button", "Create").should("be.disabled")
  })

  it("links to the library from the notebooks section", () => {
    cy.contains("a", "View all").click()
    cy.url().should("include", "/app/library")
  })

  it("shows recent activity or an empty state", () => {
    cy.contains("h2", "Recent activity").should("be.visible")
    cy.contains(
      /No recent activity yet|Uploaded |Generated |Saved |Just now|\d+h ago|\d+d ago/
    ).should("be.visible")
  })
})
