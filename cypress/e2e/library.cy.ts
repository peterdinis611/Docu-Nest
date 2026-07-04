describe("Library", () => {
  beforeEach(function () {
    cy.skipWithoutAuth()
    cy.signInTestUser()
    cy.visit("/app/library")
  })

  it("loads the library page", () => {
    cy.contains("h1", "Library").should("be.visible")
    cy.get('input[placeholder="Search documents…"]').should("be.visible")
  })

  it("filters documents with search", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Your library is empty")) {
        cy.contains("Your library is empty").should("be.visible")
        return
      }

      cy.get('input[placeholder="Search documents…"]').type("zzzz-no-match")
      cy.contains("No documents found").should("be.visible")
    })
  })

  it("switches between grid and list view", () => {
    cy.get('[aria-label="Grid view"]').click()
    cy.get('[aria-label="Grid view"]').should("have.class", "bg-secondary")

    cy.get('[aria-label="List view"]').click()
    cy.get('[aria-label="List view"]').should("have.class", "bg-secondary")
  })

  it("shows document type filters", () => {
    cy.contains('[role="tab"]', "All").should("be.visible")
    cy.contains('[role="tab"]', "PDF").click()
    cy.contains('[role="tab"]', "PDF").should("have.attr", "data-state", "active")
  })
})
