/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from "@angular/core/testing"
import { AppComponent } from "./app.component"
import { RouterTestingModule } from "@angular/router/testing"
import { ThemeService } from "./core/services/theme/theme.service"

describe("AppComponent", () => {
  let fixture: ComponentFixture<AppComponent>
  let app: AppComponent
  let themeService: jasmine.SpyObj<ThemeService>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj("ThemeService", ["setTheme"])

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [{ provide: ThemeService, useValue: spy }]
    }).compileComponents()

    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>
    fixture = TestBed.createComponent(AppComponent)
    app = fixture.componentInstance
  })

  it("should create the app", () => {
    fixture.detectChanges()
    expect(app).toBeTruthy()
  })

  it("should have router outlet", () => {
    fixture.detectChanges()
    const routerOutlet =
      fixture.debugElement.nativeElement.querySelector("router-outlet")
    expect(routerOutlet).toBeTruthy()
  })

  it("should set theme on initialization", () => {
    fixture.detectChanges()
    expect(themeService.setTheme).toHaveBeenCalledWith("system")
  })
})
