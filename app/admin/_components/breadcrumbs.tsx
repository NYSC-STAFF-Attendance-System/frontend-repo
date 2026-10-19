"use client"

import Link from "next/link"

import { useBreadcrumbs } from "../_hooks/use-breadcrumbs"

export function Breadcrumbs() {
  const crumbs = useBreadcrumbs()

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 lg:block">
      <ol className="flex min-w-0 items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1

          return (
            <li key={`${crumb.href}-${crumb.label}`} className="flex min-w-0 items-center gap-2">
              {index > 0 ? (
                <span className="text-zinc-300" aria-hidden="true">
                  ›
                </span>
              ) : null}
              {last ? (
                <span className="truncate text-nysc" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="shrink-0 text-zinc-400 transition-colors hover:text-nysc"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
