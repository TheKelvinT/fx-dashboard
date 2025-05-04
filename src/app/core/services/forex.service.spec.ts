import { TestBed } from "@angular/core/testing"
import { ForexService } from "./forex.service"
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing"
import {
  CurrencyRates,
  HistoricalRateResponse
} from "../../models/currency.model"

describe("ForexService", () => {
  let service: ForexService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ForexService]
    })

    service = TestBed.inject(ForexService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it("should be created", () => {
    expect(service).toBeTruthy()
  })

  describe("getLatestRates", () => {
    it("should fetch latest rates successfully", () => {
      const mockResponse: CurrencyRates = {
        amount: 1,
        base: "USD",
        date: "2024-03-20",
        rates: { EUR: 0.85, GBP: 0.75 }
      }

      service.getLatestRates("USD").subscribe((response) => {
        expect(response).toEqual(mockResponse)
      })

      const req = httpMock.expectOne(
        "https://api.frankfurter.app/latest?from=USD"
      )
      expect(req.request.method).toBe("GET")
      req.flush(mockResponse)
    })

    it("should handle API errors", (done) => {
      let requestCount = 0

      service.getLatestRates("USD").subscribe({
        next: () => fail("should have failed with the network error"),
        error: (error) => {
          expect(error).toBeTruthy()
          expect(requestCount).toBe(4)
          done()
        }
      })

      for (let i = 0; i < 4; i++) {
        const req = httpMock.expectOne(
          "https://api.frankfurter.app/latest?from=USD"
        )
        expect(req.request.method).toBe("GET")
        requestCount++
        req.flush(null, { status: 500, statusText: "Internal Server Error" })
      }
    })
  })

  describe("getHistoricalRates", () => {
    it("should fetch historical rates successfully", () => {
      const startDate = "2023-01-01"
      const endDate = "2023-01-02"
      const mockResponse: HistoricalRateResponse = {
        amount: 1,
        base: "USD",
        start_date: startDate,
        end_date: endDate,
        rates: {
          "2023-01-01": { EUR: 0.85 },
          "2023-01-02": { EUR: 0.86 }
        }
      }

      service
        .getHistoricalRates("USD", ["EUR"], startDate, endDate)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse)
        })

      const req = httpMock.expectOne(
        "https://api.frankfurter.app/2023-01-01..2023-01-02?from=USD&to=EUR"
      )
      expect(req.request.method).toBe("GET")
      req.flush(mockResponse)
    })
  })

  describe("getDateRange", () => {
    it("should return correct date range for day", () => {
      const range = service.getDateRange("day")
      expect(range.start).toBeTruthy()
      expect(range.end).toBeTruthy()
      expect(
        new Date(range.end).getTime() - new Date(range.start).getTime()
      ).toBeLessThanOrEqual(24 * 60 * 60 * 1000)
    })

    it("should return correct date range for week", () => {
      const range = service.getDateRange("week")
      expect(range.start).toBeTruthy()
      expect(range.end).toBeTruthy()
      expect(
        new Date(range.end).getTime() - new Date(range.start).getTime()
      ).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000)
    })

    it("should return correct date range for month", () => {
      const range = service.getDateRange("month")
      expect(range.start).toBeTruthy()
      expect(range.end).toBeTruthy()
      expect(
        new Date(range.end).getTime() - new Date(range.start).getTime()
      ).toBeLessThanOrEqual(30 * 24 * 60 * 60 * 1000)
    })
  })

  describe("getCurrencies", () => {
    it("should return available currencies", () => {
      const mockResponse = {
        USD: "US Dollar",
        EUR: "Euro",
        GBP: "British Pound"
      }

      service.getCurrencies().subscribe((currencies) => {
        expect(currencies.length).toBeGreaterThan(0)
        expect(currencies[0].code).toBeDefined()
        expect(currencies[0].name).toBeDefined()
      })

      const req = httpMock.expectOne("https://api.frankfurter.app/currencies")
      expect(req.request.method).toBe("GET")
      req.flush(mockResponse)
    })
  })
})
