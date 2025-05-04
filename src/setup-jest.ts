import "jasmine"

declare global {
  interface JasmineMatchers {
    toBe(expected: unknown): boolean
    toBeTruthy(): boolean
    toHaveBeenCalled(): boolean
    toHaveBeenCalledWith(...args: unknown[]): boolean
  }

  // Extend the existing jasmine namespace
  interface Window {
    jasmine: {
      Matchers: JasmineMatchers
    }
  }
}
