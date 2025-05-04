import { USD, AUD } from "../constants/currency.constants"

describe("Currency Converter", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://api.frankfurter.app/currencies").as(
      "getCurrencies"
    )
    cy.intercept("GET", "https://api.frankfurter.app/latest**").as("getRates")

    cy.visit("/")

    cy.wait(["@getCurrencies"])
  })

  it("should load the currency converter component", () => {
    cy.get("[data-cy=currency-converter]").should("exist")
    cy.get("[data-cy=from-currency]").should("exist")
    cy.get("[data-cy=to-currency]").should("exist")
    cy.get("[data-cy=amount-input]").should("exist")
  })

  it("should load currencies correctly", () => {
    cy.get("[data-cy=from-currency]").click()

    cy.get("[data-cy=from-currency]").type(USD)

    cy.get(".ant-select-dropdown").should("be.visible")
    cy.get(".ant-select-item-option-content").should("have.length.gt", 0)

    cy.get(".ant-select-item-option-content").contains(USD).click()

    cy.get("[data-cy=from-currency]").should("contain", USD)
  })

  it("should convert currency when amount is entered", () => {
    cy.get("[data-cy=from-currency]").click().type(USD)
    cy.get(".ant-select-dropdown").should("be.visible")
    cy.get(".ant-select-item-option-content").contains(USD).click()


    cy.get("[data-cy=to-currency]").click().type(AUD)
    cy.get(".ant-select-dropdown").should("be.visible")
    cy.get(".ant-select-item-option-content").contains(AUD).click()

    cy.get("[data-cy=amount-input]").clear().type("100")
    cy.get("[data-cy=exchange-rate]").should("be.visible")
  })

  it("should swap currencies when swap button is clicked", () => {
    cy.get("[data-cy=from-currency]").click().type(USD)
    cy.get(".ant-select-dropdown").should("be.visible")
    cy.get(".ant-select-item-option-content").contains(USD).click()

    cy.get("[data-cy=to-currency]").click().type(AUD)
    cy.get(".ant-select-dropdown").should("be.visible")
    cy.get(".ant-select-item-option-content").contains(AUD).click()

    cy.get("[data-cy=amount-input]").clear().type("100")

    cy.get("[data-cy=exchange-rate]").invoke("text").as("initialRate")

    cy.get("[data-cy=swap-button]").click()

    cy.get("[data-cy=from-currency]").should("contain", AUD)
    cy.get("[data-cy=to-currency]").should("contain", USD)
  })

  it("should handle offline mode gracefully", () => {
    cy.get("[data-cy=from-currency]").click()
    cy.get(".ant-select-dropdown").should("be.visible")
    cy.get("[data-cy=from-currency]").type(USD)
    cy.get(".ant-select-item-option-content")
      .contains(USD)
      .should("be.visible")
      .click()

    cy.get("[data-cy=to-currency]").click()
    cy.get(".ant-select-dropdown").should("be.visible")
    cy.get("[data-cy=to-currency]").type(AUD)
    cy.get(".ant-select-item-option-content")
      .contains(AUD)
      .should("be.visible")
      .click()

    cy.window().then((win) => {
      Object.defineProperty(win.navigator, "onLine", { value: false })
      win.dispatchEvent(new Event("offline"))
    })

    cy.get("[data-cy=amount-input]").clear().type("100")

    cy.get("[data-cy=cached-data-indicator]").should("be.visible")

    cy.get("[data-cy=exchange-rate]")
      .should("be.visible")
      .and("contain", USD)
      .and("contain", AUD)
  })

  it("should display the currency converter", () => {
    cy.intercept("GET", "https://api.frankfurter.app/latest**", {
      statusCode: 200,
      body: {
        amount: 1,
        base: "MYR",
        date: "2024-03-21",
        rates: {
          USD: 0.21,
          AUD: 0.32
        }
      }
    }).as("getRates")

    cy.get("[data-cy=to-currency]").click()
    cy.get(".ant-select-dropdown").should("be.visible")

    cy.get("[data-cy=to-currency]").type(USD)

    cy.get(".ant-select-item-option-content")
      .contains(USD)
      .should("be.visible")
      .click()

    cy.get("[data-cy=to-currency]")
      .find(".ant-select-selection-item")
      .should("contain", USD)

    cy.wait("@getRates").then((interception) => {
      assert.equal(interception.response?.statusCode, 200)
    })
  })
})
