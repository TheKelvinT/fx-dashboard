/// <reference types="jasmine" />

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from "@angular/core/testing"
import { CurrencyConverterComponent } from "./currency-converter.component"
import { OfflineForexService } from "../../../../core/services/offline/offline-forex.service"
import { ConnectionService } from "../../../../core/services/offline/connection.service"
import { HttpClientTestingModule } from "@angular/common/http/testing"
import { FormsModule } from "@angular/forms"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzSelectModule } from "ng-zorro-antd/select"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzIconModule } from "ng-zorro-antd/icon"
import { of } from "rxjs"
import { CurrencyRates } from "../../../../models/currency.model"
import { provideNoopAnimations } from "@angular/platform-browser/animations"

describe("CurrencyConverterComponent", () => {
  let component: CurrencyConverterComponent
  let fixture: ComponentFixture<CurrencyConverterComponent>
  let offlineForexService: jasmine.SpyObj<OfflineForexService>
  let connectionService: jasmine.SpyObj<ConnectionService>

  const mockRates: CurrencyRates = {
    amount: 1,
    base: "USD",
    date: "2024-03-20",
    rates: { EUR: 0.85 }
  }

  const mockSwappedRates: CurrencyRates = {
    amount: 1,
    base: "EUR",
    date: "2024-03-20",
    rates: { USD: 1.1765 } // 1/0.85 = 1.1765
  }

  beforeEach(async () => {
    const offlineSpy = jasmine.createSpyObj("OfflineForexService", [
      "getExchangeRate"
    ])
    const connectionSpy = jasmine.createSpyObj("ConnectionService", [
      "isOnline",
      "getOnlineStatus"
    ])

    connectionSpy.isOnline.and.returnValue(true)
    connectionSpy.getOnlineStatus.and.returnValue(of(true))

    await TestBed.configureTestingModule({
      imports: [
        CurrencyConverterComponent,
        HttpClientTestingModule,
        FormsModule,
        NzInputModule,
        NzSelectModule,
        NzButtonModule,
        NzIconModule
      ],
      providers: [
        { provide: OfflineForexService, useValue: offlineSpy },
        { provide: ConnectionService, useValue: connectionSpy },
        provideNoopAnimations()
      ]
    }).compileComponents()

    offlineForexService = TestBed.inject(
      OfflineForexService
    ) as jasmine.SpyObj<OfflineForexService>
    connectionService = TestBed.inject(
      ConnectionService
    ) as jasmine.SpyObj<ConnectionService>
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyConverterComponent)
    component = fixture.componentInstance
    component.fromCurrency = "USD"
    component.toCurrency = "EUR"
    component.fromAmount = 100
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })

  it("should initialize with default values", () => {
    expect(component.fromCurrency).toBe("USD")
    expect(component.toCurrency).toBe("EUR")
    expect(component.fromAmount).toBe(100)
    expect(component.toAmount).toBe(0)
    expect(component.isLoading).toBe(false)
  })

  it("should convert currency", fakeAsync(() => {
    offlineForexService.getExchangeRate.and.returnValue(of(mockRates))

    component.loadExchangeRate()
    tick()
    fixture.detectChanges()

    expect(offlineForexService.getExchangeRate).toHaveBeenCalledWith(
      "USD",
      "EUR"
    )
    expect(component.toAmount).toBe(85)
  }))

  it("should handle currency swap", fakeAsync(() => {
    offlineForexService.getExchangeRate.and.returnValue(of(mockRates))
    component.loadExchangeRate()
    tick()
    fixture.detectChanges()

    expect(component.fromAmount).toBe(100)
    expect(component.toAmount).toBe(85)

    offlineForexService.getExchangeRate.and.returnValue(of(mockSwappedRates))
    component.swapCurrencies()
    tick()
    fixture.detectChanges()

    expect(component.fromCurrency).toBe("EUR")
    expect(component.toCurrency).toBe("USD")
    expect(component.fromAmount).toBe(85)
    expect(component.toAmount).toBe(100)
  }))

  it("should handle API errors", fakeAsync(() => {
    offlineForexService.getExchangeRate.and.returnValue(
      of({
        amount: 1,
        base: "USD",
        date: "2024-03-20",
        rates: {}
      })
    )

    component.loadExchangeRate()
    tick()
    fixture.detectChanges()

    expect(component.toAmount).toBe(0)
    expect(component.isLoading).toBe(false)
  }))

  it("should check online status on initialization", () => {
    expect(connectionService.getOnlineStatus).toHaveBeenCalled()
  })
})
