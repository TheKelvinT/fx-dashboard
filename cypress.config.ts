import { defineConfig } from "cypress"
import webpackPreprocessor from "@cypress/webpack-preprocessor"
import webpackConfig from "./cypress/webpack.config"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    experimentalStudio: true,
    setupNodeEvents(on) {
      on(
        "file:preprocessor",
        webpackPreprocessor({ webpackOptions: webpackConfig })
      )
    }
  },
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack"
    },
    specPattern: "**/*.cy.ts"
  }
})
