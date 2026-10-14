import Link from "next/link"
import {
  ChevronRight,
  ClipboardCheck,
  Download,
  IdCard,
  QrCode,
} from "lucide-react"

import { cn } from "@/lib/utils"

const actions = [
  {
    title: "Generate Office QR",
    description: "Dynamic daily QR code",
    icon: QrCode,
    iconClass: "bg-mint text-nysc-green",
    href: "/admin/settings/office-qr",
  },
  {
    title: "Export Attendance Report",
    description: "CSV, PDF or Excel summary",
    icon: Download,
    iconClass: "bg-surface-50 text-slate",
    href: "/admin/reports",
  },
  {
    title: "Review Pending Approvals",
    description: "Biometric & device requests",
    icon: ClipboardCheck,
    iconClass: "bg-surface-50 text-slate",
    href: "/admin/staff",
    badge: 12,
  },
  {
    title: "Staff Directory",
    description: "Browse, edit, and onboard",
    icon: IdCard,
    iconClass: "bg-surface-50 text-slate",
    href: "/admin/staff",
  },
]

export function QuickActions() {
  return (
    <section className="rounded-2xl border border-line/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-ink">
          Quick Actions
        </h2>
        <span className="text-xs font-medium text-olive-muted">Admin Portal</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex w-full items-center gap-3 rounded-xl border border-line/80 bg-white px-3 py-3 text-left transition-colors hover:bg-surface-50"
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  action.iconClass
                )}
              >
                <Icon className="size-4" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {action.title}
                  </span>
                  {action.badge ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-semibold text-white">
                      {action.badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-xs text-slate">
                  {action.description}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-surface-300" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
