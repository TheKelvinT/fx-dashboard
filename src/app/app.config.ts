import { ApplicationConfig, importProvidersFrom } from "@angular/core"
import { provideRouter, withViewTransitions } from "@angular/router"
import { provideAnimations } from "@angular/platform-browser/animations"
import { HttpClientModule } from "@angular/common/http"
import { registerLocaleData } from "@angular/common"
import en from "@angular/common/locales/en"
import { provideNzI18n, en_US } from "ng-zorro-antd/i18n"
import { ForexService } from "./core/services/forex.service"
import { ConnectionService } from "./core/services/offline/connection.service"
import { StorageService } from "./core/services/offline/storage.service"
import { OfflineForexService } from "./core/services/offline/offline-forex.service"
import { ThemeService } from "./core/services/theme/theme.service"
import { NzIconModule } from "ng-zorro-antd/icon"
import { IconDefinition } from "@ant-design/icons-angular"
import {
  SunOutline,
  MoonOutline,
  LaptopOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  DisconnectOutline,
  SwapOutline,
  InfoCircleOutline,
  SearchOutline
} from "@ant-design/icons-angular/icons"
import { routes } from "./app.routes"

registerLocaleData(en)

const icons: IconDefinition[] = [
  SunOutline,
  MoonOutline,
  LaptopOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  DisconnectOutline,
  SwapOutline,
  InfoCircleOutline,
  SearchOutline
]

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimations(),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(NzIconModule.forRoot(icons)),
    provideNzI18n(en_US),
    ForexService,
    ConnectionService,
    StorageService,
    OfflineForexService,
    ThemeService
  ]
}
