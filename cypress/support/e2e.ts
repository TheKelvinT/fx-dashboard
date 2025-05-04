// Import commands.js using ES2015 syntax:
import "./commands"

// Augment Cypress types using module augmentation
export {}
declare global {
  // Use module augmentation instead of namespace
  interface Cypress {
    Chainable: {
      // Add custom commands here if needed
      // Example:
      // login(email: string, password: string): Chainable<void>
    }
  }
}

// Prevent uncaught exceptions from failing tests
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})

// Hide fetch/XHR requests from command log
const app = window.top
if (app) {
  app.document.addEventListener("DOMContentLoaded", () => {
    const style = app.document.createElement("style")
    style.innerHTML = `
      .command-name-xhr,
      .command-name-fetch { display: none }
    `
    app.document.head.appendChild(style)
  })
}
