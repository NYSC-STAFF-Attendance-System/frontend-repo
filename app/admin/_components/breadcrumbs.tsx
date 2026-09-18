"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type Crumb = {
  href: string
  label: string
}

const sectionCrumbs: { prefix: string; label: string }[] = [
  { prefix: "/admin/staff", label: "Staff Management" },
  { prefix: "/admin/attendance", label: "Attendance Management" },
  { prefix: "/admin/reports", label: "Reports" },
  { prefix: "/admin/settings", label: "Settings" },
  { prefix: "/admin/audit-log", label: "Audit Log" },
]

function crumbsFor(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ href: "/admin", label: "Admin Panel" }]
  const section = sectionCrumbs.find((item) => pathname.startsWith(item.prefix))

  if (!section) {
    return crumbs
  }

  crumbs.push({ href: section.prefix, label: section.label })

  if (pathname.startsWith("/admin/settings/office-qr")) {
    crumbs.push({ href: pathname, label: "Office QR Management" })
  }

  if (
    section.prefix === "/admin/attendance" &&
    pathname !== "/admin/attendance"
  ) {
    const correction = pathname.match(/^\/admin\/attendance\/([^/]+)\/correct$/)
    if (correction) {
      crumbs.push({
        href: `/admin/attendance/${correction[1]}`,
        label: "Attendance Details",
      })
      crumbs.push({ href: pathname, label: "Record Correction" })
    } else {
      crumbs.push({ href: pathname, label: "Attendance Details" })
    }
  }

  return crumbs
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const crumbs = crumbsFor(pathname)

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
