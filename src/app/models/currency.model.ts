export interface Currency {
  code: string
  name: string
}

export interface CurrencyRates {
  amount: number
  base: string
  date: string
  rates: { [key: string]: number }
}

export interface HistoricalRateResponse {
  amount: number
  base: string
  start_date: string
  end_date: string
  rates: {
    [date: string]: {
      [currency: string]: number
    }
  }
}

export interface ExchangeRateResponse {
  amount: number
  base: string
  date: string
  rates: { [key: string]: number }
}

export interface RateData {
  key: string
  code: string
  currency: string
  rate: number
  change?: number
}

export interface ChartData {
  date: Date
  value: number
  currency: string
  change: number
}
