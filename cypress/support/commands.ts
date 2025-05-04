// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Example of a custom command for handling offline mode
Cypress.Commands.add("goOffline", () => {
  cy.window().then((win) => {
    cy.stub(win.navigator, "onLine").value(false)
    win.dispatchEvent(new Event("offline"))
  })
})

Cypress.Commands.add("goOnline", () => {
  cy.window().then((win) => {
    cy.stub(win.navigator, "onLine").value(true)
    win.dispatchEvent(new Event("online"))
  })
})

// Command to wait for loading states to complete
Cypress.Commands.add("waitForLoading", () => {
  cy.get("[data-cy=loading-indicator]").should("not.exist")
  cy.get("[data-cy=loading-spinner]").should("not.exist")
})

// Command to select currency from dropdown
Cypress.Commands.add("selectCurrency", (selector: string, currency: string) => {
  cy.get(`[data-cy=${selector}]`).click()
  cy.get(`[data-cy=currency-option-${currency}]`).click()
})

// Command to verify error state
Cypress.Commands.add(
  "verifyErrorState",
  (errorSelector: string, retrySelector: string) => {
    cy.get(`[data-cy=${errorSelector}]`).should("be.visible")
    cy.get(`[data-cy=${retrySelector}]`).should("be.visible")
    cy.get(`[data-cy=${retrySelector}]`).click()
    cy.get(`[data-cy=${errorSelector}]`).should("not.exist")
  }
)
