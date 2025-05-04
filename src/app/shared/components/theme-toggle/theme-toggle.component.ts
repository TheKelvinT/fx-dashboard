import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { NzDropDownModule } from "ng-zorro-antd/dropdown"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzMenuModule } from "ng-zorro-antd/menu"
import { ThemeService, Theme } from "../../../services/theme/theme.service"

@Component({
  selector: "app-theme-toggle",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDropDownModule,
    NzIconModule,
    NzButtonModule,
    NzMenuModule
  ],
  templateUrl: "./theme-toggle.component.html",
  styleUrls: ["./theme-toggle.component.scss"]
})
export class ThemeToggleComponent implements OnInit {
  currentTheme: Theme = "system"

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.currentTheme
    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme
    })
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme)
  }

  getThemeIcon(): string {
    const activeTheme = this.themeService.activeTheme
    if (activeTheme === "dark") {
      return "moon"
    }
    return "sun"
  }
}
