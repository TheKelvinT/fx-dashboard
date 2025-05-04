import { Component, OnDestroy, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NzAlertModule } from "ng-zorro-antd/alert"
import { NzIconModule } from "ng-zorro-antd/icon"
import { ConnectionService } from "../../../core/services/offline/connection.service"
import { Subscription } from "rxjs"

@Component({
  selector: "app-offline-indicator",
  standalone: true,
  imports: [CommonModule, NzAlertModule, NzIconModule],
  templateUrl: "./offline-indicator.component.html",
  styleUrls: ["./offline-indicator.component.scss"]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOnline = true
  private subscription?: Subscription

  constructor(private connectionService: ConnectionService) {}

  ngOnInit(): void {
    this.isOnline = this.connectionService.isOnline()

    this.subscription = this.connectionService
      .getOnlineStatus()
      .subscribe((online) => {
        this.isOnline = online
      })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
