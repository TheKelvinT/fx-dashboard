describe("Currency Dashboard Flow", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://api.frankfurter.app/currencies").as(
      "getCurrencies"
    )

    cy.intercept(
      "GET",
      "https://api.frankfurter.app/*/from=*",
      {
        statusCode: 200,
        body: {
          amount: 1,
          base: "MYR",
          start_date: "2024-03-21",
          end_date: "2024-04-21",
          rates: {
            "2024-03-21": { EUR: 0.2, GBP: 0.17 },
            "2024-04-21": { EUR: 0.21, GBP: 0.18 }
          }
        }
      }
    ).as("getHistoricalRates")

    cy.intercept("GET", "https://api.frankfurter.app/latest*").as("getRates")

    cy.visit("/dashboard")
    cy.wait("@getCurrencies")
  })

  it("should handle basic currency selection", () => {
    cy.get("[data-cy=exchange-table]").should("exist")
    cy.get("[data-cy=historical-chart]").should("exist")

    cy.get("[data-cy=rate-row-GBP]").click()
    cy.get("[data-cy=rate-row-GBP]").should("have.class", "selected-row")

    cy.get("[data-cy=currency-tag-GBP]", { timeout: 10000 }).should("exist")

    cy.get("[data-cy=chart-container]").should("be.visible")
  })

  it("should enforce maximum currency selection limit", () => {
    cy.get("[data-cy=exchange-table]").within(() => {
      cy.get("[data-cy^=rate-row-]").first().click()
      cy.get("[data-cy^=rate-row-]").eq(1).click()
      cy.get("[data-cy^=rate-row-]").eq(2).click()

      cy.get("[data-cy^=rate-row-]").eq(3).click()
    })

    cy.get(".selected-row").should("have.length", 3)
  })

  it("should handle timeframe change", () => {
    cy.get("[data-cy=rate-row-EUR]").click()
    cy.get("[data-cy=currency-tag-EUR]", { timeout: 10000 }).should("exist")

    cy.get("[data-cy=timeframe-month]").click()

    cy.get("[data-cy=currency-tag-EUR]", { timeout: 10000 }).should("exist")
  })
})
