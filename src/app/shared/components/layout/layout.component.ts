import { Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { CommonModule } from "@angular/common"
import { NzLayoutModule } from "ng-zorro-antd/layout"
import { NzIconModule } from "ng-zorro-antd/icon"
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle.component"

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    NzLayoutModule,
    NzIconModule,
    ThemeToggleComponent
  ],
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent {
  isCollapsed = false
  title = "FX Dashboard"

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed
  }
}
