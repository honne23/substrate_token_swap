export type NonNegativeInteger<T extends number> =
number extends T
    ? never
    : `${T}` extends `-${string}` | `${string}.${string}`
        ? never
        : T;

export const invalidAmountError = new Error("invalid amount supplied");

export function getTrace(error: unknown) {
    if (error instanceof Error) return error.message
    return String(error)
  }
