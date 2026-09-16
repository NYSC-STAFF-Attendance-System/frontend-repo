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
    iconClass: "bg-emerald-50 text-nysc",
  },
  {
    title: "Export Attendance Report",
    description: "CSV, PDF or Excel summary",
    icon: Download,
    iconClass: "bg-zinc-100 text-zinc-500",
  },
  {
    title: "Review Pending Approvals",
    description: "Biometric & device requests",
    icon: ClipboardCheck,
    iconClass: "bg-zinc-100 text-zinc-500",
    badge: 12,
  },
  {
    title: "Staff Directory",
    description: "Browse, edit, and onboard",
    icon: IdCard,
    iconClass: "bg-zinc-100 text-zinc-500",
  },
]

export function QuickActions() {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900">
          Quick Actions
        </h2>
        <span className="text-xs font-medium text-zinc-400">Admin Portal</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.title}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border border-zinc-200/80 bg-white px-3 py-3 text-left transition-colors hover:bg-zinc-50"
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
                  <span className="text-sm font-semibold text-zinc-800">
                    {action.title}
                  </span>
                  {action.badge ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                      {action.badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-400">
                  {action.description}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-zinc-300" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
