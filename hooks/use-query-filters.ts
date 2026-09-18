"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Primitive = string | number | boolean;

function parseValue<T extends Primitive>(raw: string, fallback: T): T {
  if (typeof fallback === "boolean") {
    return (raw === "1" || raw === "true") as T;
  }
  if (typeof fallback === "number") {
    const next = Number(raw);
    return (Number.isFinite(next) ? next : fallback) as T;
  }
  return raw as T;
}

function serializeValue<T extends Primitive>(value: T, fallback: T): string | null {
  if (value === fallback) return null;
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return String(value);
  if (value === "") return null;
  return String(value);
}

/**
 * Keeps filter values in the route query string so a URL can be shared or
 * restored after login. Defaults are omitted from the address bar.
 */
export function useQueryFilters<T extends Record<string, Primitive>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const filters = useMemo(() => {
    const next = { ...defaults };
    for (const key of Object.keys(defaults) as Array<keyof T>) {
      const raw = searchParams.get(String(key));
      if (raw === null) continue;
      next[key] = parseValue(raw, defaults[key]);
    }
    return next;
    // searchParams identity changes; the string is the stable signal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const write = useCallback(
    (next: T) => {
      const params = new URLSearchParams();
      for (const key of Object.keys(defaults) as Array<keyof T>) {
        const serialized = serializeValue(next[key], defaults[key]);
        if (serialized !== null) params.set(String(key), serialized);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [defaults, pathname, router],
  );

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      const next = { ...filters, ...patch };
      if ("page" in defaults && !("page" in patch)) {
        (next as T & { page: number }).page = defaults.page as number;
      }
      write(next);
    },
    [defaults, filters, write],
  );

  const resetFilters = useCallback(() => {
    write(defaults);
  }, [defaults, write]);

  return { filters, setFilters, resetFilters };
}
