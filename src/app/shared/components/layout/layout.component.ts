import { Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .app-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class LayoutComponent {}
