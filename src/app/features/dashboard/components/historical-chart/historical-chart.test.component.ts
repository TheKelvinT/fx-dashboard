import { Component } from "@angular/core"

@Component({
  selector: "app-historical-chart-test",
  template: `
    <div data-cy="historical-chart">
      <div>
        <div data-cy="timeframe-selector">
          <button data-cy="timeframe-month">Month</button>
        </div>

        <div data-cy="base-currency-selector">
          <div data-cy="currency-option-EUR"></div>
          <div data-cy="currency-option-GBP"></div>
          <button data-cy="apply-selection">Apply</button>
        </div>

        <div data-cy="chart-container">
          <div data-cy="chart-legend"></div>
          <button data-cy="reset-zoom">Reset Zoom</button>
        </div>

        <div data-cy="loading-indicator"></div>
        <div data-cy="error-message">
          <button data-cy="retry-button">Retry</button>
        </div>
      </div>
    </div>
  `
})
export class HistoricalChartTestComponent {}
