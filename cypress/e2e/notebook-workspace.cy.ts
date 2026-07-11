describe("Notebook workspace", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visitNotebookWorkspace()
  })

  it("shows the workspace layout", () => {
    cy.get('[aria-label="Toggle sources panel"]').should("be.visible")
    cy.get('[aria-label="Toggle studio panel"]').should("be.visible")
    cy.get('[aria-label="Search"]').should("be.visible")
    cy.contains("button", "Share").should("be.visible")
  })

  it("shows sources and studio panels by default", () => {
    cy.contains("h2", "Sources").should("be.visible")
    cy.contains("h2", "Studio").should("be.visible")
    cy.contains("Generate from your sources").should("be.visible")
  })

  it("shows studio generation options", () => {
    cy.contains("button", "Audio Overview").should("be.visible")
    cy.contains("button", "Study Guide").should("be.visible")
    cy.contains("button", "FAQ").should("be.visible")
    cy.contains("button", "Flashcards").should("be.visible")
  })

  it("toggles the sources panel", () => {
    cy.get('[aria-label="Toggle sources panel"]').click()
    cy.contains("h2", "Sources").should("not.be.visible")

    cy.get('[aria-label="Toggle sources panel"]').click()
    cy.contains("h2", "Sources").should("be.visible")
  })

  it("toggles the studio panel", () => {
    cy.get('[aria-label="Toggle studio panel"]').click()
    cy.contains("h2", "Studio").should("not.be.visible")

    cy.get('[aria-label="Toggle studio panel"]').click()
    cy.contains("h2", "Studio").should("be.visible")
  })

  it("opens the share notebook dialog", () => {
    cy.contains("button", "Share").click()

    cy.get('[role="dialog"]').within(() => {
      cy.contains("Share notebook").should("be.visible")
      cy.contains("Share link").should("be.visible")
      cy.contains("Invite by email").should("be.visible")
      cy.contains("button", "Copy").should("be.visible")
    })
  })

  it("shows the chat input in the main panel", () => {
    cy.get("textarea").should("be.visible")
    cy.get("textarea").should("have.attr", "placeholder").and("not.be.empty")
  })

  it("opens global search from the notebook top bar", () => {
    cy.get('[aria-label="Search"]').click()
    cy.get('[role="dialog"]').should("be.visible")
    cy.get('input[placeholder*="Search notebooks"]').should("be.visible")
  })
})
