declare global {
  namespace Cypress {
    interface Chainable {
      skipWithoutAuth(): Chainable<void>
      signInTestUser(): Chainable<void>
      hasTestCredentials(): Chainable<boolean>
      openGlobalSearch(): Chainable<void>
      uniqueTestName(prefix: string): Chainable<string>
      visitNotebookWorkspace(): Chainable<void>
      createNotebook(title: string, description?: string): Chainable<void>
    }
  }
}

function hasTestCredentials(): boolean {
  return Boolean(Cypress.env("testEmail") && Cypress.env("testPassword"))
}

Cypress.Commands.add("hasTestCredentials", () => {
  return cy.wrap(hasTestCredentials())
})

Cypress.Commands.add("skipWithoutAuth", function () {
  if (!hasTestCredentials()) {
    cy.log("Skipping — set CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD")
    this.skip()
  }
})

Cypress.Commands.add("signInTestUser", () => {
  if (!hasTestCredentials()) {
    throw new Error(
      "Set CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD in .env.local to run authenticated tests."
    )
  }

  cy.session(
    "clerk-test-user",
    () => {
      cy.visit("/")
      cy.clerkLoaded()
      cy.clerkSignIn({
        strategy: "password",
        identifier: Cypress.env("testEmail"),
        password: Cypress.env("testPassword"),
      })
    },
    {
      validate() {
        cy.visit("/app")
        cy.url().should("include", "/app")
      },
    }
  )
})

Cypress.Commands.add("openGlobalSearch", () => {
  cy.get("aside").contains("button", "Search…").click()
  cy.get('[role="dialog"]').should("be.visible")
  cy.contains("Search notebooks, documents, and pages").should("exist")
})

Cypress.Commands.add("uniqueTestName", (prefix: string) => {
  return cy.wrap(`${prefix} ${Date.now()}`)
})

Cypress.Commands.add("createNotebook", (title: string, description?: string) => {
  cy.contains("button", "New notebook").click()

  cy.get('[role="dialog"]').within(() => {
    cy.get("#notebook-title").clear().type(title)
    if (description) {
      cy.get("#notebook-desc").clear().type(description)
    }
    cy.contains("button", "Create").click()
  })

  cy.url({ timeout: 15000 }).should("match", /\/notebook\/.+/)
})

Cypress.Commands.add("visitNotebookWorkspace", () => {
  cy.visit("/app")

  cy.get("body").then(($body) => {
    const href = $body.find('a[href^="/notebook/"]').first().attr("href")

    if (href) {
      cy.visit(href)
      return
    }

    cy.uniqueTestName("E2E Workspace").then((title) => {
      cy.createNotebook(title, "Opened by Cypress for workspace tests")
    })
  })

  cy.url({ timeout: 15000 }).should("match", /\/notebook\/.+/)
})

export {}
