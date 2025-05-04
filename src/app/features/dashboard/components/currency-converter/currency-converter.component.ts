import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzCardModule } from "ng-zorro-antd/card"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzToolTipModule } from "ng-zorro-antd/tooltip"
import { ScrollingModule } from "@angular/cdk/scrolling"
import { Currency } from "../../../../models/currency.model"
import { OfflineForexService } from "../../../../core/services/offline/offline-forex.service"
import { ConnectionService } from "../../../../core/services/offline/connection.service"
import { OfflineIndicatorComponent } from "../../../../shared/components/offline-indicator/offline-indicator.component"
import { ForexService } from "../../../../core/services/forex.service"
import { DEFAULT_CURRENCY } from "../../../../constants/currency.constants"

@Component({
  selector: "app-currency-converter",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzCardModule,
    NzIconModule,
    NzToolTipModule,
    ScrollingModule,
    OfflineIndicatorComponent
  ],
  templateUrl: "./currency-converter.component.html",
  styleUrls: ["./currency-converter.component.scss"]
})
export class CurrencyConverterComponent implements OnInit, OnChanges {
  @Input() currencies: Currency[] = []
  @Input() isLoadingCurrencies = false

  filteredFromCurrencies: Currency[] = []
  filteredToCurrencies: Currency[] = []

  fromAmount = 100
  toAmount = 0
  fromCurrency = "MYR"
  toCurrency = DEFAULT_CURRENCY

  private previousFromCurrency = "MYR"
  private previousToCurrency = DEFAULT_CURRENCY

  currentRate = 0
  lastUpdated: Date | null = null
  isLoading = false

  isOnline = true

  constructor(
    private offlineForexService: OfflineForexService,
    private connectionService: ConnectionService,
    private forexService: ForexService
  ) {}

  ngOnInit(): void {
    this.isOnline = this.connectionService.isOnline()

    this.connectionService.getOnlineStatus().subscribe((online) => {
      this.isOnline = online
    })

    if (this.currencies.length > 0) {
      console.log("Initial currencies:", this.currencies)
      this.initializeFilters()
      this.loadExchangeRate()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currencies"] && this.currencies.length > 0) {
      console.log("Updated currencies:", this.currencies)
      this.initializeFilters()
      this.loadExchangeRate()
    }
  }

  initializeFilters(): void {
    this.filteredFromCurrencies = [...this.currencies]
    this.filteredToCurrencies = [...this.currencies]
    console.log("Filtered currencies:", this.filteredFromCurrencies)
  }

  loadExchangeRate(): void {
    this.isLoading = true
    this.offlineForexService
      .getExchangeRate(this.fromCurrency, this.toCurrency)
      .subscribe({
        next: (data) => {
          if (data.rates && data.rates[this.toCurrency]) {
            this.currentRate = data.rates[this.toCurrency]
            this.calculateToAmount()
            this.lastUpdated = new Date()
          }
          this.isLoading = false
        },
        error: (error) => {
          console.error("Error loading exchange rate:", error)
          this.isLoading = false
        }
      })
  }

  swapCurrencies(): void {
    const tempCurrency = this.fromCurrency
    this.fromCurrency = this.toCurrency
    this.toCurrency = tempCurrency

    const tempAmount = this.fromAmount
    this.fromAmount = this.toAmount
    this.toAmount = tempAmount

    this.previousFromCurrency = this.fromCurrency
    this.previousToCurrency = this.toCurrency

    this.loadExchangeRate()
  }

  onFromCurrencyChange(): void {
    if (this.fromCurrency === this.toCurrency) {
      this.toCurrency = this.previousFromCurrency
    }

    this.previousFromCurrency = this.fromCurrency

    this.loadExchangeRate()
  }

  onToCurrencyChange(): void {
    if (this.toCurrency === this.fromCurrency) {
      this.fromCurrency = this.previousToCurrency
    }

    this.previousToCurrency = this.toCurrency

    this.loadExchangeRate()
  }

  onFromAmountChange(): void {
    this.calculateToAmount()
  }

  onToAmountChange(): void {
    if (this.currentRate > 0) {
      this.fromAmount = +(this.toAmount / this.currentRate).toFixed(2)
    }
  }

  calculateToAmount(): void {
    this.toAmount = +(this.fromAmount * this.currentRate).toFixed(2)
  }

  onSearchFromCurrency(value: string): void {
    console.log("Searching from currency:", value)
    this.filteredFromCurrencies = this.currencies.filter(
      (item) =>
        item.code.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
        item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    )
    console.log("Filtered from currencies:", this.filteredFromCurrencies)
  }

  onSearchToCurrency(value: string): void {
    console.log("Searching to currency:", value)
    this.filteredToCurrencies = this.currencies.filter(
      (item) =>
        item.code.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
        item.name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    )
    console.log("Filtered to currencies:", this.filteredToCurrencies)
  }

  getCountryFlag(currencyCode: string): string {
    return currencyCode.substring(0, 2).toLowerCase()
  }
}
