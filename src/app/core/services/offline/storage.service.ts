import { Injectable } from "@angular/core"

export interface StoredData<T> {
  timestamp: number
  data: T
}

@Injectable({
  providedIn: "root"
})
export class StorageService {
  private readonly PREFIX = "fx_dashboard_"

  constructor() {}

  saveData<T>(key: string, data: T): void {
    try {
      const storageKey = this.getStorageKey(key)
      const storageData: StoredData<T> = {
        timestamp: Date.now(),
        data
      }

      localStorage.setItem(storageKey, JSON.stringify(storageData))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
  }

  getData<T>(key: string): StoredData<T> | null {
    try {
      const storageKey = this.getStorageKey(key)
      const storedData = localStorage.getItem(storageKey)

      if (!storedData) {
        return null
      }

      return JSON.parse(storedData) as StoredData<T>
    } catch (error) {
      console.error("Error retrieving data from localStorage:", error)
      return null
    }
  }

  hasValidData(key: string, maxAge?: number): boolean {
    try {
      const data = this.getData(key)
      if (!data) {
        return false
      }

      if (maxAge) {
        const currentTime = Date.now()
        const dataAge = currentTime - data.timestamp
        return dataAge <= maxAge
      }

      return true
    } catch (error) {
      console.error("Error checking data validity:", error)
      return false
    }
  }

  clearData(key: string): void {
    try {
      const storageKey = this.getStorageKey(key)
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error("Error clearing data from localStorage:", error)
    }
  }

  clearAllData(): void {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.PREFIX))
        .forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error("Error clearing all data from localStorage:", error)
    }
  }

  private getStorageKey(key: string): string {
    return `${this.PREFIX}${key}`
  }
}
