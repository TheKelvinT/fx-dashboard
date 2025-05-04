import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { map, catchError, retry } from "rxjs/operators"
import {
  Currency,
  CurrencyRates,
  HistoricalRateResponse,
  ExchangeRateResponse
} from "../../models/currency.model"

@Injectable({
  providedIn: "root"
})
export class ForexService {
  private baseUrl = "https://api.frankfurter.app"

  constructor(private http: HttpClient) {}

  getLatestRates(base: string = "MYR"): Observable<CurrencyRates> {
    return this.http
      .get<CurrencyRates>(`${this.baseUrl}/latest?from=${base}`)
      .pipe(retry(3), catchError(this.handleError))
  }

  getExchangeRate(from: string, to: string): Observable<ExchangeRateResponse> {
    return this.http
      .get<ExchangeRateResponse>(`${this.baseUrl}/latest?from=${from}&to=${to}`)
      .pipe(retry(3), catchError(this.handleError))
  }

  getCurrencies(): Observable<Currency[]> {
    return this.http
      .get<{ [key: string]: string }>(`${this.baseUrl}/currencies`)
      .pipe(
        map((response) => {
          return Object.entries(response).map(([code, name]) => ({
            code,
            name
          }))
        }),
        retry(2),
        catchError(this.handleError)
      )
  }

  getHistoricalRates(
    baseCurrency: string,
    targetCurrencies: string[],
    startDate: string,
    endDate: string
  ): Observable<HistoricalRateResponse> {
    const currenciesParam = targetCurrencies.join(",")
    return this.http
      .get<HistoricalRateResponse>(
        `${this.baseUrl}/${startDate}..${endDate}?from=${baseCurrency}&to=${currenciesParam}`
      )
      .pipe(retry(2), catchError(this.handleError))
  }

  getDateRange(period: "day" | "week" | "month" | "year"): {
    start: string
    end: string
  } {
    const end = new Date()
    const start = new Date()

    switch (period) {
      case "day":
        start.setDate(end.getDate() - 1)
        break
      case "week":
        start.setDate(end.getDate() - 7)
        break
      case "month":
        start.setDate(end.getDate() - 30)
        break
      case "year":
        start.setDate(end.getDate() - 365)
        break
    }

    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = ""
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
    }
    console.error(errorMessage)
    return throwError(() => new Error(errorMessage))
  }
}
