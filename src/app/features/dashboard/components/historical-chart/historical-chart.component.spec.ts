import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from "@angular/core/testing"
import { HistoricalChartComponent } from "./historical-chart.component"
import { ForexService } from "../../../../core/services/forex.service"
import { FormsModule } from "@angular/forms"
import { NzRadioModule } from "ng-zorro-antd/radio"
import { NzIconModule } from "ng-zorro-antd/icon"
import { of } from "rxjs"
import { HistoricalRateResponse } from "../../../../models/currency.model"
import { provideNoopAnimations } from "@angular/platform-browser/animations"
import { ThemeService } from "../../../../core/services/theme/theme.service"
import { NzIconService } from "ng-zorro-antd/icon"
import { CommonModule } from "@angular/common"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzEmptyModule } from "ng-zorro-antd/empty"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzSpinModule } from "ng-zorro-antd/spin"
import { HttpClientModule } from "@angular/common/http"
import { HttpClientTestingModule } from "@angular/common/http/testing"

describe("HistoricalChartComponent", () => {
  let component: HistoricalChartComponent
  let fixture: ComponentFixture<HistoricalChartComponent>
  let forexService: jasmine.SpyObj<ForexService>
  let themeService: jasmine.SpyObj<ThemeService>

  const generateMockData = (days: number): HistoricalRateResponse => {
    const rates: { [key: string]: { [key: string]: number } } = {}
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]
      rates[dateStr] = {
        EUR: 0.85 + Math.random() * 0.1,
        GBP: 0.75 + Math.random() * 0.1,
        JPY: 110 + Math.random() * 10
      }
    }

    return {
      amount: 1,
      base: "USD",
      start_date: startDate.toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      rates
    }
  }

  beforeEach(async () => {
    const forexSpy = jasmine.createSpyObj("ForexService", [
      "getHistoricalRates",
      "getDateRange"
    ])
    const themeSpy = jasmine.createSpyObj("ThemeService", [], {
      activeTheme: "light",
      activeTheme$: of("light")
    })

    forexSpy.getHistoricalRates.and.returnValue(of(generateMockData(30)))

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        NzButtonModule,
        NzRadioModule,
        NzIconModule,
        NzEmptyModule,
        NzTagModule,
        NzSpinModule,
        HistoricalChartComponent,
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ForexService, useValue: forexSpy },
        { provide: ThemeService, useValue: themeSpy },
        NzIconService,
        provideNoopAnimations()
      ]
    }).compileComponents()

    forexService = TestBed.inject(ForexService) as jasmine.SpyObj<ForexService>
    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalChartComponent)
    component = fixture.componentInstance
    component.baseCurrency = "USD"
    component.selectedCurrencies = ["EUR", "GBP", "JPY"]
    component.timeFrame = "day"

    forexService.getDateRange.and.returnValue({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0]
    })

    forexService.getHistoricalRates.and.returnValue(of(generateMockData(30)))

    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })

  it("should initialize with default values", () => {
    expect(component.baseCurrency).toBe("USD")
    expect(component.selectedCurrencies).toEqual(["EUR", "GBP", "JPY"])
    expect(component.timeFrame).toBe("day")
    expect(component.isLoading).toBeFalse()
    expect(component.hasError).toBeFalse()
  })

  it("should load and process historical data", fakeAsync(() => {
    component.loadData()
    tick()
    fixture.detectChanges()

    expect(forexService.getHistoricalRates).toHaveBeenCalled()
    expect(component.chartData.length).toBeGreaterThan(0)
    expect(component.aggregatedData.length).toBeGreaterThan(0)
  }))

  it("should handle different timeframes correctly", fakeAsync(() => {
    component.timeFrame = "day"
    component.loadData()
    tick()
    fixture.detectChanges()
    const dayDataLength = component.aggregatedData.length


    component.timeFrame = "week"
    component.loadData()
    tick()
    fixture.detectChanges()
    const weekDataLength = component.aggregatedData.length

    component.timeFrame = "month"
    component.loadData()
    tick()
    fixture.detectChanges()
    const monthDataLength = component.aggregatedData.length

    expect(dayDataLength).toBeGreaterThan(weekDataLength)
    expect(weekDataLength).toBeGreaterThan(monthDataLength)
  }))

  it("should process chart data correctly", fakeAsync(() => {
    component.loadData()
    tick()
    fixture.detectChanges()

    component.chartData.forEach((dataPoint) => {
      expect(dataPoint.date).toBeInstanceOf(Date)
      expect(dataPoint.currency).toBeDefined()
      expect(dataPoint.value).toBeDefined()
      expect(dataPoint.change).toBeDefined()
    })

    component.aggregatedData.forEach((dataPoint) => {
      expect(dataPoint.date).toBeInstanceOf(Date)
      expect(dataPoint.currency).toBeDefined()
      expect(dataPoint.value).toBeDefined()
      expect(dataPoint.change).toBeDefined()
    })
  }))

  it("should handle timeframe changes", fakeAsync(() => {
    component.timeFrame = "month"
    component.onTimeFrameChange()
    tick()
    fixture.detectChanges()

    expect(component.timeFrame).toBe("month")
    expect(forexService.getHistoricalRates).toHaveBeenCalled()
  }))

  it("should handle theme changes", fakeAsync(() => {
    expect(component.currentTheme).toBe("light")
    expect(themeService.activeTheme$).toBeDefined()
  }))

  it("should handle chart data processing correctly", fakeAsync(() => {
    component.selectedCurrencies = ["EUR"]
    component.loadData()
    tick()
    fixture.detectChanges()

    expect(component.chartData.length).toBeGreaterThan(0)
    expect(component.chartData[0]).toEqual(
      jasmine.objectContaining({
        currency: "EUR",
        value: jasmine.any(Number),
        change: jasmine.any(Number)
      })
    )
  }))

  it("should update chart when timeframe changes", fakeAsync(() => {
    component.selectedCurrencies = ["EUR"]
    component.timeFrame = "day"
    component.loadData()
    tick()
    fixture.detectChanges()

    const dayCallCount = forexService.getHistoricalRates.calls.count()

    component.timeFrame = "week"
    component.onTimeFrameChange()
    tick()
    fixture.detectChanges()

    expect(forexService.getHistoricalRates.calls.count()).toBe(dayCallCount + 1)
  }))
})
