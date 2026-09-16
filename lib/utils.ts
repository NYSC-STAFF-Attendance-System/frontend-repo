import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compile-time guard for unions that must be handled exhaustively.
 *
 * Call it in the default branch of a switch over a union. If every case is
 * covered, TypeScript narrows the value to `never` and this compiles. If a new
 * case is later added to the union and a screen forgets it, the argument is no
 * longer `never` and the build fails at that switch - which is the point. The
 * twelve /scan outcomes are the reason this exists.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
