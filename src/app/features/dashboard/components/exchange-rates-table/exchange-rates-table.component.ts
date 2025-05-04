import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core"
import { CommonModule, DatePipe } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NzGridModule } from "ng-zorro-antd/grid"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzCardModule } from "ng-zorro-antd/card"
import {
  Currency,
  RateData,
  CurrencyRates
} from "../../../../models/currency.model"
import { OfflineForexService } from "../../../../core/services/offline/offline-forex.service"
import { ConnectionService } from "../../../../core/services/offline/connection.service"
import { interval, Subscription } from "rxjs"
import { switchMap, takeWhile } from "rxjs/operators"
import { ForexService } from "../../../../core/services/forex.service"
import { DEFAULT_CURRENCY } from "../../../../constants/currency.constants"
import { NzIconService } from "ng-zorro-antd/icon"

@Component({
  selector: "app-exchange-rates-table",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzIconModule,
    NzTableModule,
    NzSelectModule,
    NzCardModule,
    DatePipe
  ],
  templateUrl: "./exchange-rates-table.component.html",
  styleUrls: ["./exchange-rates-table.component.scss"]
})
export class ExchangeRatesTableComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() baseCurrency: string = DEFAULT_CURRENCY
  @Output() baseCurrencyChange = new EventEmitter<string>()
  @Output() currencySelected = new EventEmitter<string>()
  @Input() currencies: Currency[] = []
  @Input() isLoadingCurrencies = false
  filteredCurrencies: Currency[] = []
  rateData: RateData[] = []
  filteredData: RateData[] = []

  @Input() selectedCurrencies: string[] = []

  pageSize = 10
  pageIndex = 1
  total = 0

  isLoading = false

  private pollingSubscription: Subscription | null = null
  private countdownSubscription: Subscription | null = null
  pollingInterval = 60000
  lastUpdated: Date | null = null
  nextUpdateIn = this.pollingInterval / 1000

  isOnline = true
  private connectionSubscription?: Subscription

  hasError = false
  errorMessage = ""

  constructor(
    private offlineForexService: OfflineForexService,
    private connectionService: ConnectionService,
    private forexService: ForexService,
    private iconService: NzIconService
  ) {}

  ngOnInit(): void {
    this.isOnline = this.connectionService.isOnline()

    this.connectionSubscription = this.connectionService
      .getOnlineStatus()
      .subscribe((online) => {
        this.isOnline = online

        if (online && this.lastUpdated) {
          this.loadRates()
        }
      })

    if (this.currencies.length === 0) {
      this.isLoadingCurrencies = true
      this.forexService.getCurrencies().subscribe({
        next: (currencies) => {
          this.currencies = currencies
          this.initializeFilters()
          this.isLoadingCurrencies = false
        },
        error: (error) => {
          console.error("Error loading currencies:", error)
          this.hasError = true
          this.errorMessage = "Failed to load currencies"
          this.isLoadingCurrencies = false
        }
      })
    } else {
      this.initializeFilters()
    }

    this.startPolling()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["currencies"] && this.currencies.length > 0) {
      this.initializeFilters()
    }
  }

  ngOnDestroy(): void {
    this.stopPolling()
    this.stopCountdown()

    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe()
    }
  }

  initializeFilters(): void {
    this.filteredCurrencies = [...this.currencies].sort((a, b) =>
      a.code.localeCompare(b.code)
    )
    this.filteredData = this.rateData
  }

  startPolling(): void {
    this.loadRates()

    if (this.isOnline) {
      this.pollingSubscription = interval(this.pollingInterval)
        .pipe(
          switchMap(() =>
            this.offlineForexService.getLatestRates(this.baseCurrency)
          )
        )
        .subscribe((data) => {
          this.processRatesData(data)
        })
    }

    this.startCountdown()
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe()
      this.pollingSubscription = null
    }
  }

  startCountdown(): void {
    if (!this.isOnline) {
      return
    }

    this.stopCountdown()
    this.nextUpdateIn = this.pollingInterval / 1000
    this.countdownSubscription = interval(1000)
      .pipe(takeWhile(() => this.nextUpdateIn > 0))
      .subscribe(() => {
        this.nextUpdateIn--
        if (this.nextUpdateIn <= 0) {
          this.nextUpdateIn = this.pollingInterval / 1000
        }
      })
  }

  stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe()
      this.countdownSubscription = null
    }
  }

  loadRates(): void {
    this.isLoading = true
    this.offlineForexService.getLatestRates(this.baseCurrency).subscribe({
      next: (data) => {
        this.processRatesData(data)
        this.isLoading = false
      },
      error: (error) => {
        console.error("Error loading rates:", error)
        this.isLoading = false
      }
    })
  }

  processRatesData(data: CurrencyRates): void {
    if (!data || !data.rates) {
      this.hasError = true
      this.errorMessage = "Failed to load exchange rates"
      return
    }

    const previousRates = new Map(
      this.rateData.map((item) => [item.code, item.rate])
    )

    this.rateData = Object.entries(data.rates).map(([code, rate]) => {
      const previousRate = previousRates.get(code)
      const change = previousRate
        ? ((rate - previousRate) / previousRate) * 100
        : 0

      const currency =
        this.currencies.find((c) => c.code === code)?.name || code

      return {
        key: code,
        currency: `${code} - ${currency}`,
        code,
        rate,
        change
      }
    })

    this.lastUpdated = new Date()
    this.total = this.rateData.length
    this.filteredData = this.rateData

    if (this.isOnline) {
      this.startCountdown()
    }
  }

  updateBaseCurrency(currency: string): void {
    this.baseCurrency = currency
    this.baseCurrencyChange.emit(currency)

    this.stopPolling()
    this.stopCountdown()

    this.rateData = []
    this.filteredData = []

    this.isLoading = true
    this.loadRates()

    if (this.isOnline) {
      this.startPolling()
    }
  }

  onSearchDropdown(searchTerm: string): void {
    this.filteredCurrencies = this.currencies.filter((currency) => {
      const normalizedTerm = (searchTerm || "").toLowerCase()
      return (
        currency.code.toLowerCase().includes(normalizedTerm) ||
        currency.name.toLowerCase().includes(normalizedTerm)
      )
    })
  }

  toggleCurrencySelection(currency: string): void {
    this.currencySelected.emit(currency)
  }

  isCurrencySelected(currency: string): boolean {
    return this.selectedCurrencies.includes(currency)
  }

  sortByCurrency = (a: RateData, b: RateData): number => {
    return a.code.localeCompare(b.code)
  }

  sortByRate = (a: RateData, b: RateData): number => {
    return b.rate - a.rate // Sort in descending order
  }

  sortByChange = (a: RateData, b: RateData): number => {
    return (b.change || 0) - (a.change || 0) // Sort in descending order
  }

  formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" + secs : secs}`
  }
}
