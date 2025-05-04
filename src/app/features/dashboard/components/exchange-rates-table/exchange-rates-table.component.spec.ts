/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from "@angular/core/testing"
import { ExchangeRatesTableComponent } from "./exchange-rates-table.component"
import { OfflineForexService } from "../../../../core/services/offline/offline-forex.service"
import { ConnectionService } from "../../../../core/services/offline/connection.service"
import { FormsModule } from "@angular/forms"
import { NzTableModule } from "ng-zorro-antd/table"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzIconModule } from "ng-zorro-antd/icon"
import { of } from "rxjs"
import { Currency, CurrencyRates } from "../../../../models/currency.model"
import { provideNoopAnimations } from "@angular/platform-browser/animations"
import { HttpClientTestingModule } from "@angular/common/http/testing"
import { ForexService } from "../../../../core/services/forex.service"
import { HttpClientModule } from "@angular/common/http"

describe("ExchangeRatesTableComponent", () => {
  let component: ExchangeRatesTableComponent
  let fixture: ComponentFixture<ExchangeRatesTableComponent>
  let offlineForexService: jasmine.SpyObj<OfflineForexService>
  let connectionService: jasmine.SpyObj<ConnectionService>
  let forexService: jasmine.SpyObj<ForexService>

  const mockCurrencies: Currency[] = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" }
  ]

  const mockRates: CurrencyRates = {
    amount: 1,
    base: "USD",
    date: "2024-03-20",
    rates: { EUR: 0.85, GBP: 0.75 }
  }

  beforeEach(async () => {
    const forexSpy = jasmine.createSpyObj("OfflineForexService", [
      "getLatestRates"
    ])
    const connectionSpy = jasmine.createSpyObj("ConnectionService", [
      "isOnline",
      "getOnlineStatus"
    ])
    const forexServiceSpy = jasmine.createSpyObj("ForexService", [
      "getLatestRates",
      "getHistoricalRates"
    ])

    await TestBed.configureTestingModule({
      imports: [
        ExchangeRatesTableComponent,
        FormsModule,
        NzTableModule,
        NzSelectModule,
        NzIconModule,
        HttpClientTestingModule,
        HttpClientModule
      ],
      providers: [
        { provide: OfflineForexService, useValue: forexSpy },
        { provide: ConnectionService, useValue: connectionSpy },
        { provide: ForexService, useValue: forexServiceSpy },
        provideNoopAnimations()
      ]
    }).compileComponents()

    offlineForexService = TestBed.inject(
      OfflineForexService
    ) as jasmine.SpyObj<OfflineForexService>
    connectionService = TestBed.inject(
      ConnectionService
    ) as jasmine.SpyObj<ConnectionService>
    forexService = TestBed.inject(ForexService) as jasmine.SpyObj<ForexService>
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeRatesTableComponent)
    component = fixture.componentInstance
    component.baseCurrency = "USD"
    component.selectedCurrencies = ["EUR", "GBP"]
    component.currencies = mockCurrencies
    connectionService.isOnline.and.returnValue(true)
    connectionService.getOnlineStatus.and.returnValue(of(true))
    offlineForexService.getLatestRates.and.returnValue(of(mockRates))
    forexService.getLatestRates.and.returnValue(of(mockRates))
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })

  it("should load and display exchange rates", () => {
    expect(offlineForexService.getLatestRates).toHaveBeenCalledWith("USD")

    expect(component.rateData.length).toBe(2)
    expect(component.rateData[0].key).toBe("EUR")
    expect(component.rateData[0].code).toBe("EUR")
    expect(component.rateData[0].currency).toBe("EUR - Euro")
    expect(component.rateData[0].rate).toBe(0.85)
    expect(component.rateData[1].key).toBe("GBP")
    expect(component.rateData[1].code).toBe("GBP")
    expect(component.rateData[1].currency).toBe("GBP - British Pound")
    expect(component.rateData[1].rate).toBe(0.75)
  })

  it("should update base currency and reload rates", () => {
    spyOn(component.baseCurrencyChange, "emit")

    component.updateBaseCurrency("EUR")

    expect(component.baseCurrency).toBe("EUR")
    expect(component.baseCurrencyChange.emit).toHaveBeenCalledWith("EUR")
    expect(offlineForexService.getLatestRates).toHaveBeenCalledWith("EUR")
  })

  it("should filter currencies based on search term", () => {
    component.onSearchDropdown("eur")
    expect(component.filteredCurrencies).toEqual([
      { code: "EUR", name: "Euro" }
    ])
  })

  it("should emit currency selection", () => {
    spyOn(component.currencySelected, "emit")
    component.toggleCurrencySelection("EUR")
    expect(component.currencySelected.emit).toHaveBeenCalledWith("EUR")
  })
})
