import { Component, OnDestroy, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NzGridModule } from "ng-zorro-antd/grid"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzCardModule } from "ng-zorro-antd/card"
import { Currency } from "../../models/currency.model"
import { HistoricalChartComponent } from "./components/historical-chart/historical-chart.component"
import { ExchangeRatesTableComponent } from "./components/exchange-rates-table/exchange-rates-table.component"
import { CurrencyConverterComponent } from "./components/currency-converter/currency-converter.component"
import { OfflineForexService } from "../../core/services/offline/offline-forex.service"
import { ConnectionService } from "../../core/services/offline/connection.service"
import { OfflineIndicatorComponent } from "../../shared/components/offline-indicator/offline-indicator.component"
import { Subscription } from "rxjs"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzIconModule,
    NzCardModule,
    HistoricalChartComponent,
    ExchangeRatesTableComponent,
    CurrencyConverterComponent,
    OfflineIndicatorComponent
  ],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit, OnDestroy {
  baseCurrency = "MYR"
  selectedCurrencies: string[] = []
  currencies: Currency[] = []
  isLoadingCurrencies = false

  isOnline = true
  private connectionSubscription?: Subscription

  constructor(
    private offlineForexService: OfflineForexService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.isOnline = this.connectionService.isOnline()

    this.connectionSubscription = this.connectionService
      .getOnlineStatus()
      .subscribe((online: boolean) => {
        this.isOnline = online
      })

    this.loadCurrencies()
  }

  ngOnDestroy(): void {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe()
    }
  }

  loadCurrencies(): void {
    this.isLoadingCurrencies = true
    this.offlineForexService.getCurrencies().subscribe({
      next: (data: any) => {
        console.log("Dashboard loaded currencies:", data)
        this.currencies = data
        this.isLoadingCurrencies = false
      },
      error: (error: any) => {
        console.error("Error loading currencies:", error)
        this.isLoadingCurrencies = false
      }
    })
  }

  onBaseCurrencyChange(currency: string): void {
    this.baseCurrency = currency
    this.selectedCurrencies = []
  }

  toggleCurrencySelection(currency: string): void {
    const index = this.selectedCurrencies.indexOf(currency)

    if (index === -1) {
      if (this.selectedCurrencies.length < 3) {
        this.selectedCurrencies = [...this.selectedCurrencies, currency]
      }
    } else {
      const newSelections = [...this.selectedCurrencies]
      newSelections.splice(index, 1)
      this.selectedCurrencies = newSelections
    }
  }
}
