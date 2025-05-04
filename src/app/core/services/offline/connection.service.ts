import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable, fromEvent, merge, of } from "rxjs"
import { map } from "rxjs/operators"

@Injectable({
  providedIn: "root"
})
export class ConnectionService {
  private online = new BehaviorSubject<boolean>(navigator.onLine)
  public online$ = this.online.asObservable()

  constructor() {
    this.online.next(navigator.onLine)

    merge(
      of(navigator.onLine),
      fromEvent(window, "online").pipe(map(() => true)),
      fromEvent(window, "offline").pipe(map(() => false))
    ).subscribe((online) => {
      this.online.next(online)
    })
  }

  isOnline(): boolean {
    return navigator.onLine
  }

  getOnlineStatus(): Observable<boolean> {
    return this.online$
  }
}
