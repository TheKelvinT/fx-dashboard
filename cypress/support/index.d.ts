declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to simulate offline mode
     * @example cy.goOffline()
     */
    goOffline(): Chainable<void>

    /**
     * Custom command to simulate online mode
     * @example cy.goOnline()
     */
    goOnline(): Chainable<void>

    /**
     * Custom command to wait for loading states to complete
     * @example cy.waitForLoading()
     */
    waitForLoading(): Chainable<void>

    /**
     * Custom command to select a currency from a dropdown
     * @param selector - The data-cy selector for the dropdown
     * @param currency - The currency code to select
     * @example cy.selectCurrency('from-currency', 'USD')
     */
    selectCurrency(selector: string, currency: string): Chainable<void>

    /**
     * Custom command to verify and handle error states
     * @param errorSelector - The data-cy selector for the error message
     * @param retrySelector - The data-cy selector for the retry button
     * @example cy.verifyErrorState('error-message', 'retry-button')
     */
    verifyErrorState(
      errorSelector: string,
      retrySelector: string
    ): Chainable<void>
  }
}
