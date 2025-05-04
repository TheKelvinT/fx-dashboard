import { Routes } from "@angular/router"
import { LayoutComponent } from "./shared/components/layout/layout.component"
import { HistoricalChartTestComponent } from "./features/dashboard/components/historical-chart/historical-chart.test.component"

export const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadChildren: () =>
          import("./features/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          )
      }
    ]
  },
  { path: "test/historical-chart", component: HistoricalChartTestComponent },
  { path: "**", redirectTo: "" }
]
