"use client"

import { FileWarning, Lock, RefreshCw } from "lucide-react"

import { cn } from "@/lib/utils"
import { type Activity, type ActivityStatus } from "../_data"
import { useRecentActivity } from "../_hooks/use-recent-activity"

const tabs = [
  { id: "all", label: "All Events" },
  { id: "attendance", label: "Attendance" },
  { id: "approvals", label: "Approvals" },
] as const

const avatarClass: Record<Activity["avatar"], string> = {
  green: "bg-mint text-nysc-green",
  dark: "bg-ink text-white",
  rose: "bg-danger-soft text-danger",
  mint: "bg-cream text-nysc-dark",
  gray: "bg-surface-50 text-slate",
}

function StatusCell({
  status,
  label,
}: {
  status: ActivityStatus
  label: string
}) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-danger">
        <FileWarning className="size-3.5" />
        {label}
      </span>
    )
  }

  if (status === "device-reset") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate">
        <Lock className="size-3.5" />
        {label}
      </span>
    )
  }

  const color =
    status === "present" || status === "approved"
      ? "text-nysc-green"
      : status === "late"
        ? "text-danger-muted"
        : "text-slate"

  const dot =
    status === "present" || status === "approved"
      ? "bg-nysc-green"
      : status === "late"
        ? "bg-danger-rose"
        : "bg-slate"

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", color)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  )
}

export function RecentActivity() {
  const { tab, rows, setTab } = useRecentActivity()

  return (
    <section className="overflow-hidden rounded-2xl border border-line/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="flex flex-col gap-3 px-4 pt-5 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            Recent Activity
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-nysc-dark">
            <span className="size-1.5 animate-pulse rounded-full bg-nysc-green" />
            Live stream
          </span>
        </div>

        <div className="flex max-w-full items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-3 sm:text-sm",
                tab === item.id
                  ? "bg-mint text-nysc-dark"
                  : "text-slate hover:text-ink"
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className="ml-1 rounded-full p-1.5 text-slate hover:bg-surface-50 hover:text-ink"
            aria-label="Refresh activity"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-left">
          <thead>
            <tr className="border-y border-surface-200 text-xs font-medium text-olive-muted">
              <th className="px-5 py-3 font-medium">Staff Member</th>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-surface-200 last:border-b-0">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        avatarClass[row.avatar]
                      )}
                    >
                      {row.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {row.name}
                      </p>
                      <p className="truncate text-xs text-slate">{row.detail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-olive">{row.time}</td>
                <td className="px-5 py-3.5 text-sm text-olive">{row.location}</td>
                <td className="px-5 py-3.5">
                  <StatusCell status={row.status} label={row.statusLabel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm">
        <p className="text-slate">
          Showing {rows.length} of 184 events today
        </p>
        <a href="#audit" className="font-medium text-nysc-green hover:underline">
          View Complete Audit Trail →
        </a>
      </div>
    </section>
  )
}
