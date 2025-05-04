import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

import { NzGridModule } from "ng-zorro-antd/grid"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzCardModule } from "ng-zorro-antd/card"

import { DashboardRoutingModule } from "./dashboard-routing.module"
import { DashboardComponent } from "./dashboard.component"

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    NzGridModule,
    NzIconModule,
    NzCardModule,
    DashboardComponent
  ]
})
export class DashboardModule {}
