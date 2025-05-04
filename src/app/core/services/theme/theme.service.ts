import { Injectable, Renderer2, RendererFactory2 } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"

export type Theme = "light" | "dark" | "system"

@Injectable({
  providedIn: "root"
})
export class ThemeService {
  private readonly THEME_KEY = "fx_dashboard_theme"
  private renderer: Renderer2
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme())

  private _activeTheme: "light" | "dark" = "light"
  private activeThemeSubject = new BehaviorSubject<"light" | "dark">("light")

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null)
    this.initializeTheme()
    this.listenForSystemThemeChanges()
  }

  get theme$(): Observable<Theme> {
    return this.themeSubject.asObservable()
  }

  get activeTheme$(): Observable<"light" | "dark"> {
    return this.activeThemeSubject.asObservable()
  }

  get currentTheme(): Theme {
    return this.themeSubject.value
  }

  get activeTheme(): "light" | "dark" {
    return this._activeTheme
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme)
    localStorage.setItem(this.THEME_KEY, theme)
    this.applyTheme(theme)
  }

  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme
    return savedTheme || "system"
  }

  private initializeTheme(): void {
    this.applyTheme(this.themeSubject.value)
  }

  private applyTheme(theme: Theme): void {
    const finalTheme = theme === "system" ? this.getSystemTheme() : theme

    this._activeTheme = finalTheme

    this.renderer.removeClass(document.body, "light-theme")
    this.renderer.removeClass(document.body, "dark-theme")
    this.renderer.addClass(document.body, `${finalTheme}-theme`)

    this.renderer.setAttribute(
      document.documentElement,
      "data-theme",
      finalTheme
    )

    this.activeThemeSubject.next(finalTheme)
  }

  private getSystemTheme(): "light" | "dark" {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  private listenForSystemThemeChanges(): void {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (this.themeSubject.value === "system") {
          this.applyTheme("system")
        }
      })
  }
}
