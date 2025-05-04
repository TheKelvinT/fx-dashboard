import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzRadioModule } from "ng-zorro-antd/radio"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzEmptyModule } from "ng-zorro-antd/empty"
import { NzTagModule } from "ng-zorro-antd/tag"
import { NzSpinModule } from "ng-zorro-antd/spin"
import { ForexService } from "../../../../core/services/forex.service"
import {
  ChartData,
  HistoricalRateResponse
} from "../../../../models/currency.model"
import { Chart, ChartConfiguration, ChartDataset } from "chart.js"
import "chart.js/auto"
import "chartjs-adapter-moment"
import "chartjs-plugin-zoom"
import moment from "moment"
import { ThemeService } from "../../../../core/services/theme/theme.service"
import { SwapRightOutline } from "@ant-design/icons-angular/icons"
import { NzIconService } from "ng-zorro-antd/icon"
import zoomPlugin from "chartjs-plugin-zoom"
import { Subscription } from "rxjs"
import { DEFAULT_CURRENCY } from "../../../../constants/currency.constants"

@Component({
  selector: "app-historical-chart",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzRadioModule,
    NzIconModule,
    NzEmptyModule,
    NzTagModule,
    NzSpinModule
  ],
  templateUrl: "./historical-chart.component.html",
  styleUrls: ["./historical-chart.component.scss"]
})
export class HistoricalChartComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
  @Input() baseCurrency: string = DEFAULT_CURRENCY
  @Input() selectedCurrencies: string[] = []
  @ViewChild("chartContainer") chartContainer!: ElementRef

  timeFrame: "day" | "week" | "month" = "week"
  isLoading = false
  chartData: ChartData[] = []
  aggregatedData: ChartData[] = []
  chartWidth = "100%"
  colorPalette = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf"
  ]
  hasError = false
  errorMessage = ""
  chart: Chart | null = null
  chartId = "currency-chart-" + Math.random().toString(36).substr(2, 9)
  isZoomed = false

  private pendingRender = false
  private themeSubscription: Subscription = new Subscription()
  currentTheme: "light" | "dark" = "light"
  private resizeObserver: ResizeObserver | null = null

  constructor(
    private forexService: ForexService,
    private iconService: NzIconService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.iconService.addIcon(SwapRightOutline)
    Chart.register(zoomPlugin)
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.activeTheme
    this.themeSubscription = this.themeService.activeTheme$.subscribe(
      (newTheme: "light" | "dark") => {
        if (newTheme !== this.currentTheme) {
          this.currentTheme = newTheme

          if (this.chart) {
            this.destroyChart()

            setTimeout(() => {
              if (this.chartContainer) {
                this.forceRedraw()
              }
            }, 100)
          }
        }
      }
    )

    this.loadData()
  }

  ngAfterViewInit(): void {
    if (this.pendingRender) {
      this.renderChart()
    }

    if (this.chartContainer?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.chart) {
          this.chart.resize()
        }
      })
      this.resizeObserver.observe(this.chartContainer.nativeElement)
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedCurrencies"] || changes["baseCurrency"]) {
      if (this.selectedCurrencies.length > 0) {
        this.loadData()
      } else {
        this.clearChart()
      }
    }
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe()
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    this.clearChart()
  }

  onTimeFrameChange(): void {
    this.loadData()
  }

  removeCurrency(currency: string): void {
    const index = this.selectedCurrencies.indexOf(currency)
    if (index !== -1) {
      this.selectedCurrencies.splice(index, 1)
      this.loadData()
    }
  }

  loadData(): void {
    if (!this.selectedCurrencies || this.selectedCurrencies.length === 0) {
      this.chartData = []
      this.clearChart()
      return
    }

    this.isLoading = true
    this.hasError = false

    const startDate = new Date()
    const endDate = new Date()

    switch (this.timeFrame) {
      case "day":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "week":
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case "month":
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    const dateRange = {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0]
    }

    this.forexService
      .getHistoricalRates(
        this.baseCurrency,
        this.selectedCurrencies,
        dateRange.start,
        dateRange.end
      )
      .subscribe({
        next: (data) => {
          if (!data || !data.rates || Object.keys(data.rates).length === 0) {
            this.hasError = true
            this.errorMessage =
              "No historical data available for the selected currencies and time frame."
            this.chartData = []
          } else {
            try {
              this.processChartData(data)

              if (this.timeFrame === "day" && this.aggregatedData.length > 0) {
                const uniqueDays = [
                  ...new Set(
                    this.aggregatedData.map(
                      (d) => d.date.toISOString().split("T")[0]
                    )
                  )
                ].length
                const minWidth = Math.max(uniqueDays * 24, 800)
                this.chartWidth = `${minWidth}px`
              } else {
                this.chartWidth = "100%"
              }
            } catch (err) {
              console.error("Error processing chart data:", err)
              this.hasError = true
              this.errorMessage =
                "Error processing chart data. Please try again."
            }
          }

          this.isLoading = false

          if (this.chartContainer) {
            setTimeout(() => this.renderChart(), 0)
          } else {
            this.pendingRender = true
          }
        },
        error: (error) => {
          console.error("Error fetching historical data", error)
          this.isLoading = false
          this.hasError = true
          this.errorMessage =
            "Failed to load historical data. Please try again later."
          this.clearChart()
        }
      })
  }

  processChartData(data: HistoricalRateResponse): void {
    this.chartData = []

    const dates = Object.keys(data.rates).sort()

    this.selectedCurrencies.forEach((currency) => {
      let prevValue: number | null = null

      dates.forEach((dateStr) => {
        if (!data.rates[dateStr] || !data.rates[dateStr][currency]) {
          console.warn(`No data for ${currency} on ${dateStr}`)
          return
        }

        const value = data.rates[dateStr][currency]
        const date = new Date(dateStr)

        const change =
          prevValue !== null
            ? Number((((value - prevValue) / prevValue) * 100).toFixed(2))
            : 0

        this.chartData.push({
          date,
          currency,
          value,
          change
        })

        prevValue = value
      })
    })

    this.aggregateDataByTimeframe()
  }

  aggregateDataByTimeframe(): void {
    if (!this.chartData || this.chartData.length === 0) {
      this.aggregatedData = []
      console.warn("No chart data to aggregate")
      return
    }

    const currencyGroups = new Map<string, ChartData[]>()
    this.chartData.forEach((item) => {
      if (!currencyGroups.has(item.currency)) {
        currencyGroups.set(item.currency, [])
      }
      currencyGroups.get(item.currency)!.push(item)
    })

    this.aggregatedData = []

    currencyGroups.forEach((points, currency) => {
      const sortedPoints = points.sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      )

      if (this.timeFrame === "day") {
        const dailyData: ChartData[] = []
        let prevValue: number | null = null
        let prevDate: Date | null = null

        sortedPoints.forEach((point) => {
          if (prevValue !== null && prevDate !== null) {
            const dayChange = Number(
              (((point.value - prevValue) / prevValue) * 100).toFixed(2)
            )
            dailyData.push({
              date: point.date,
              currency: currency,
              value: point.value,
              change: dayChange
            })
          }
          prevValue = point.value
          prevDate = point.date
        })

        this.aggregatedData = this.aggregatedData.concat(dailyData)
      } else if (this.timeFrame === "week") {
        const weeklyData = this.aggregateByPeriod(
          sortedPoints,
          currency,
          (date) => {
            const day = date.getDay()
            const diff = date.getDate() - day + (day === 0 ? -6 : 1)
            return new Date(date.setDate(diff))
          }
        )
        this.aggregatedData = this.aggregatedData.concat(weeklyData)
      } else if (this.timeFrame === "month") {
        const monthlyData = this.aggregateByPeriod(
          sortedPoints,
          currency,
          (date) => {
            return new Date(date.getFullYear(), date.getMonth(), 1)
          }
        )
        this.aggregatedData = this.aggregatedData.concat(monthlyData)
      }
    })
  }

  aggregateByPeriod(
    data: ChartData[],
    currency: string,
    periodFn: (date: Date) => Date
  ): ChartData[] {
    const result: ChartData[] = []
    const periodMap = new Map<string, ChartData[]>()

    data.forEach((point) => {
      const periodKey = periodFn(new Date(point.date)).toISOString()
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, [])
      }
      periodMap.get(periodKey)!.push(point)
    })

    periodMap.forEach((points, periodKey) => {
      const periodDate = new Date(periodKey)
      const firstPoint = points[0]
      const lastPoint = points[points.length - 1]

      const periodChange = Number(
        (
          ((lastPoint.value - firstPoint.value) / firstPoint.value) *
          100
        ).toFixed(2)
      )

      result.push({
        date: periodDate,
        currency: currency,
        value: lastPoint.value,
        change: periodChange
      })
    })

    return result.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  renderChart(): void {
    if (!this.aggregatedData || this.aggregatedData.length === 0) {
      console.warn("No aggregated data to render")
      this.clearChart()
      return
    }

    if (!this.chartContainer || !this.chartContainer.nativeElement) {
      console.error("Chart container not available")
      this.hasError = true
      this.errorMessage = "Chart container not available. Please try again."
      return
    }

    this.destroyChart()

    const chartElement = this.chartContainer.nativeElement

    const oldCanvas = chartElement
    const newCanvas = document.createElement("canvas")
    newCanvas.id = this.chartId
    newCanvas.width = oldCanvas.width
    newCanvas.height = oldCanvas.height

    if (oldCanvas.parentNode) {
      oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas)
      this.chartContainer.nativeElement = newCanvas
    }

    const isDarkTheme = this.currentTheme === "dark"

    const uniqueCurrencies = [
      ...new Set(this.aggregatedData.map((d) => d.currency))
    ]

    if (uniqueCurrencies.length === 0) {
      return
    }

    try {
      const datasets: ChartDataset[] = []

      uniqueCurrencies.forEach((currency, index) => {
        const currencyData = this.aggregatedData.filter(
          (d) => d.currency === currency
        )
        if (currencyData.length === 0) {
          console.warn(`No data points for ${currency}`)
          return
        }

        const sortedData = currencyData.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        )

        const baseColor = this.colorPalette[index % this.colorPalette.length]
        let lineColor = baseColor

        if (isDarkTheme) {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.fillStyle = baseColor
            ctx.filter = "brightness(1.3)"
            ctx.fillRect(0, 0, 1, 1)
            const brighter = ctx.getImageData(0, 0, 1, 1).data
            lineColor = `rgba(${brighter[0]}, ${brighter[1]}, ${brighter[2]}, 1)`
          }
        }

        datasets.push({
          type: "line",
          label: `${this.baseCurrency}/${currency}`,
          data: sortedData.map((d) => ({
            x: d.date.getTime(),
            y: parseFloat(d.change.toFixed(2))
          })),
          borderColor: lineColor,
          backgroundColor: lineColor,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderWidth: isDarkTheme ? 3 : 2
        })
      })

      if (datasets.length === 0) {
        console.warn("No datasets created for chart")
        return
      }

      const timeUnit = (() => {
        switch (this.timeFrame) {
          case "day":
            return "day"
          case "week":
            return "week"
          case "month":
            return "month"
          default:
            return "day"
        }
      })() as "day" | "week" | "month"

      const textColor = isDarkTheme ? "#ffffff" : "#000000"

      const gridColor = isDarkTheme
        ? "rgba(255, 255, 255, 0.3)"
        : "rgba(0, 0, 0, 0.3)"
      const zeroLineColor = isDarkTheme ? "#ffffff" : "#000000"

      const tooltipBackgroundColor = isDarkTheme
        ? "rgba(50, 50, 50, 0.9)"
        : "rgba(255, 255, 255, 0.9)"
      const tooltipBorderColor = isDarkTheme
        ? "rgba(255, 255, 255, 0.3)"
        : "rgba(0, 0, 0, 0.3)"

      const xAxisConfig = {
        type: "time" as const,
        adapters: {
          date: { locale: "en" }
        },
        time: {
          unit: timeUnit,
          displayFormats: {
            day: "MMM D",
            week: "MMM D",
            month: "MMM YYYY"
          }
        },
        title: {
          display: true,
          text: (() => {
            switch (this.timeFrame) {
              case "day":
                return "Date (Past 30 Days)"
              case "week":
                return "Week (Past 3 Months)"
              case "month":
                return "Month (Past 12 Months)"
              default:
                return "Date"
            }
          })(),
          color: textColor,
          font: {
            size: 14,
            weight: 600
          },
          padding: {
            top: 10
          }
        },
        grid: {
          display: true,
          drawOnChartArea: true,
          color: gridColor,
          tickColor: gridColor,
          z: -1
        },
        ticks: {
          color: textColor,
          font: {
            size: 12,
            weight: 600
          },
          padding: 8,
          maxRotation: 45,
          minRotation: 0
        }
      }

      const chartConfig: ChartConfiguration = {
        type: "line",
        data: {
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false
          },
          hover: {
            mode: "nearest",
            intersect: false
          },
          elements: {
            line: {
              tension: 0.4,
              borderWidth: 3
            },
            point: {
              radius: 0,
              hoverRadius: 6,
              hoverBackgroundColor: isDarkTheme ? "#333" : "white",
              hoverBorderWidth: 2
            }
          },
          scales: {
            x: xAxisConfig,
            y: {
              title: {
                display: true,
                text: "% Change",
                color: textColor,
                font: {
                  size: 14,
                  weight: 600
                },
                padding: {
                  bottom: 10
                }
              },
              ticks: {
                callback: function (value) {
                  return value + "%"
                },
                color: textColor,
                font: {
                  size: 12,
                  weight: 600
                },
                padding: 8
              },
              grid: {
                display: true,
                drawOnChartArea: true,
                color: function (context) {
                  if (context.tick && context.tick.value === 0) {
                    return zeroLineColor
                  }
                  return gridColor
                },
                lineWidth: function (context) {
                  if (context.tick && context.tick.value === 0) {
                    return isDarkTheme ? 3 : 2
                  }
                  return isDarkTheme ? 1.5 : 1
                },
                z: -1
              }
            }
          },
          plugins: {
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: tooltipBackgroundColor,
              titleColor: isDarkTheme
                ? "rgba(255, 255, 255, 0.95)"
                : "rgba(0, 0, 0, 0.95)",
              bodyColor: isDarkTheme
                ? "rgba(255, 255, 255, 0.95)"
                : "rgba(0, 0, 0, 0.95)",
              borderColor: tooltipBorderColor,
              borderWidth: 1,
              padding: 12,
              titleFont: {
                size: 14,
                weight: 600
              },
              bodyFont: {
                size: 13,
                weight: 600
              },
              callbacks: {
                title: function (tooltipItems) {
                  if (tooltipItems.length === 0) return ""
                  const date = new Date(tooltipItems[0].parsed.x)
                  return moment(date).format("MMM D, YYYY")
                },
                label: function (context) {
                  let label = context.dataset.label || ""
                  if (label) {
                    label += ": "
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toFixed(2) + "%"
                  }
                  return label
                }
              }
            },
            legend: {
              display: true,
              position: "top",
              labels: {
                color: textColor,
                font: {
                  size: 13,
                  weight: 600,
                  family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                },
                padding: 15,
                usePointStyle: true,
                boxWidth: 10
              }
            },
            zoom: {
              zoom: {
                wheel: {
                  enabled: true
                },
                pinch: {
                  enabled: true
                },
                mode: "xy",
                onZoomStart: () => {
                  this.isZoomed = true
                  this.cdr.detectChanges()
                  return undefined
                }
              },
              pan: {
                enabled: true,
                mode: "xy"
              },
              limits: {
                x: { min: "original", max: "original" },
                y: { min: "original", max: "original" }
              }
            }
          }
        }
      }

      try {
        this.chart = new Chart(newCanvas, chartConfig)

        if (isDarkTheme) {
          const canvas = newCanvas as HTMLCanvasElement
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.globalAlpha = 0.9
          }
        }
      } catch (error) {
        this.hasError = true
        this.errorMessage =
          "Failed to render chart. Please try again. Error: " +
          (error instanceof Error ? error.message : String(error))
      }
    } catch (error) {
      this.hasError = true
      this.errorMessage = "Error preparing chart data. Please try again."
    }
  }

  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  clearChart(): void {
    this.chartData = []
    this.aggregatedData = []
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }

  destroyChart(): void {
    if (this.chart) {
      try {
        this.chart.destroy()
        this.chart = null

        if (this.chartContainer && this.chartContainer.nativeElement) {
          const canvas = this.chartContainer.nativeElement
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        }
      } catch (e) {
        console.warn("Error destroying chart:", e)
        this.chart = null
      }
    }
  }

  private forceRedraw(): void {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      try {
        const canvas = this.chartContainer.nativeElement
        canvas.setAttribute("data-theme", this.currentTheme)

        const container = canvas.parentElement
        const parentWidth = container ? container.clientWidth : 800
        const parentHeight = container ? container.clientHeight : 400

        const newCanvas = document.createElement("canvas")
        newCanvas.id = this.chartId
        newCanvas.setAttribute("data-theme", this.currentTheme)
        newCanvas.width = parentWidth
        newCanvas.height = parentHeight
        newCanvas.style.width = "100%"
        newCanvas.style.height = "100%"

        if (canvas.parentNode) {
          canvas.parentNode.replaceChild(newCanvas, canvas)
          this.chartContainer.nativeElement = newCanvas

          if (this.resizeObserver) {
            this.resizeObserver.unobserve(canvas)
            this.resizeObserver.observe(newCanvas)
          }

          this.cdr.markForCheck()
          this.renderChart()
        }
      } catch (err) {
        console.error("Error during chart redraw:", err)
      }
    }
  }

  resetZoom(): void {
    if (this.chart) {
      this.chart.resetZoom()
      this.isZoomed = false
      this.cdr.detectChanges()
    }
  }

  retryLoad(): void {
    this.hasError = false
    this.errorMessage = ""
    this.loadData()
  }
}
