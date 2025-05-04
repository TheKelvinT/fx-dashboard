import { Injectable } from "@angular/core"
import { Observable, of } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import { ConnectionService } from "./connection.service"
import { StorageService } from "./storage.service"
import {
  Currency,
  CurrencyRates,
  ExchangeRateResponse,
  HistoricalRateResponse
} from "../../../models/currency.model"
import { ForexService } from "../forex.service"

@Injectable({
  providedIn: "root"
})
export class OfflineForexService {
  private readonly CURRENCY_KEY = "currencies"
  private readonly RATES_KEY_PREFIX = "rates_"
  private readonly EXCHANGE_RATE_KEY_PREFIX = "exchange_rate_"
  private readonly HISTORICAL_RATES_KEY_PREFIX = "historical_rates_"

  private readonly CURRENCY_MAX_AGE = 24 * 60 * 60 * 1000
  private readonly RATES_MAX_AGE = 60 * 60 * 1000
  private readonly EXCHANGE_RATE_MAX_AGE = 60 * 60 * 1000
  private readonly HISTORICAL_RATES_MAX_AGE = 24 * 60 * 60 * 1000

  constructor(
    private forexService: ForexService,
    private connectionService: ConnectionService,
    private storageService: StorageService
  ) {}

  getCurrencies(): Observable<Currency[]> {
    if (this.connectionService.isOnline()) {
      return this.forexService.getCurrencies().pipe(
        tap((data) => {
          this.storageService.saveData(this.CURRENCY_KEY, data)
        }),
        catchError(() => {
          return this.getOfflineCurrencies()
        })
      )
    } else {
      return this.getOfflineCurrencies()
    }
  }

  getLatestRates(base: string = "MYR"): Observable<CurrencyRates> {
    const storageKey = `${this.RATES_KEY_PREFIX}${base}`

    if (this.connectionService.isOnline()) {
      return this.forexService.getLatestRates(base).pipe(
        tap((data) => {
          this.storageService.saveData(storageKey, data)
        }),
        catchError(() => {
          return this.getOfflineRates(base)
        })
      )
    } else {
      return this.getOfflineRates(base)
    }
  }

  getExchangeRate(from: string, to: string): Observable<ExchangeRateResponse> {
    const storageKey = `${this.EXCHANGE_RATE_KEY_PREFIX}${from}_${to}`

    if (this.connectionService.isOnline()) {
      return this.forexService.getExchangeRate(from, to).pipe(
        tap((data) => {
          this.storageService.saveData(storageKey, data)
        }),
        catchError(() => {
          return this.getOfflineExchangeRate(from, to)
        })
      )
    } else {
      return this.getOfflineExchangeRate(from, to)
    }
  }

  getHistoricalRates(
    baseCurrency: string,
    targetCurrencies: string[],
    startDate: string,
    endDate: string
  ): Observable<HistoricalRateResponse> {
    const storageKey = `${this.HISTORICAL_RATES_KEY_PREFIX}${baseCurrency}_${targetCurrencies.join("_")}_${startDate}_${endDate}`

    if (this.connectionService.isOnline()) {
      return this.forexService
        .getHistoricalRates(baseCurrency, targetCurrencies, startDate, endDate)
        .pipe(
          tap((data) => {
            this.storageService.saveData(storageKey, data)
          }),
          catchError(() => {
            return this.getOfflineHistoricalRates(
              baseCurrency,
              targetCurrencies,
              startDate,
              endDate
            )
          })
        )
    } else {
      return this.getOfflineHistoricalRates(
        baseCurrency,
        targetCurrencies,
        startDate,
        endDate
      )
    }
  }

  getDateRange(period: "day" | "week" | "month" | "year"): {
    start: string
    end: string
  } {
    return this.forexService.getDateRange(period)
  }

  private getOfflineCurrencies(): Observable<Currency[]> {
    const storedData = this.storageService.getData<Currency[]>(
      this.CURRENCY_KEY
    )

    if (storedData) {
      return of(storedData.data)
    } else {
      return of([])
    }
  }

  private getOfflineRates(base: string): Observable<CurrencyRates> {
    const storageKey = `${this.RATES_KEY_PREFIX}${base}`
    const storedData = this.storageService.getData<CurrencyRates>(storageKey)

    if (storedData) {
      return of(storedData.data)
    } else {
      return of({
        amount: 1,
        base,
        date: new Date().toISOString().split("T")[0],
        rates: {}
      })
    }
  }

  private getOfflineExchangeRate(
    from: string,
    to: string
  ): Observable<ExchangeRateResponse> {
    const storageKey = `${this.EXCHANGE_RATE_KEY_PREFIX}${from}_${to}`
    const storedData =
      this.storageService.getData<ExchangeRateResponse>(storageKey)

    if (storedData) {
      return of(storedData.data)
    } else {
      return of({
        amount: 1,
        base: from,
        date: new Date().toISOString().split("T")[0],
        rates: { [to]: 0 }
      })
    }
  }

  private getOfflineHistoricalRates(
    baseCurrency: string,
    targetCurrencies: string[],
    startDate: string,
    endDate: string
  ): Observable<HistoricalRateResponse> {
    const storageKey = `${this.HISTORICAL_RATES_KEY_PREFIX}${baseCurrency}_${targetCurrencies.join("_")}_${startDate}_${endDate}`
    const storedData =
      this.storageService.getData<HistoricalRateResponse>(storageKey)

    if (storedData) {
      return of(storedData.data)
    } else {
      return of({
        amount: 1,
        base: baseCurrency,
        start_date: startDate,
        end_date: endDate,
        rates: {}
      })
    }
  }
}
