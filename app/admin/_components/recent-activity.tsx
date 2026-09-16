"use client"

import { useMemo, useState } from "react"
import { FileWarning, Lock, RefreshCw } from "lucide-react"

import { cn } from "@/lib/utils"
import { recentActivity, type Activity, type ActivityStatus } from "../_data"

const tabs = [
  { id: "all", label: "All Events" },
  { id: "attendance", label: "Attendance" },
  { id: "approvals", label: "Approvals" },
] as const

type TabId = (typeof tabs)[number]["id"]

const avatarClass: Record<Activity["avatar"], string> = {
  green: "bg-emerald-100 text-nysc",
  dark: "bg-zinc-800 text-white",
  rose: "bg-rose-100 text-rose-500",
  mint: "bg-emerald-50 text-nysc",
  gray: "bg-zinc-200 text-zinc-600",
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
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500">
        <FileWarning className="size-3.5" />
        {label}
      </span>
    )
  }

  if (status === "device-reset") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500">
        <Lock className="size-3.5" />
        {label}
      </span>
    )
  }

  const color =
    status === "present" || status === "approved"
      ? "text-nysc"
      : status === "late"
        ? "text-red-500"
        : "text-zinc-500"

  const dot =
    status === "present" || status === "approved"
      ? "bg-nysc"
      : status === "late"
        ? "bg-red-500"
        : "bg-zinc-400"

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", color)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  )
}

export function RecentActivity() {
  const [tab, setTab] = useState<TabId>("all")

  const rows = useMemo(() => {
    if (tab === "all") return recentActivity
    return recentActivity.filter((item) => item.category === tab)
  }, [tab])

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">
            Recent Activity
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-nysc-muted px-2 py-0.5 text-[11px] font-semibold text-nysc">
            <span className="size-1.5 animate-pulse rounded-full bg-nysc" />
            Live stream
          </span>
        </div>

        <div className="flex items-center gap-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-nysc-muted text-nysc"
                  : "text-zinc-400 hover:text-zinc-700"
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className="ml-1 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
            aria-label="Refresh activity"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-y border-zinc-100 text-xs font-medium text-zinc-400">
              <th className="px-5 py-3 font-medium">Staff Member</th>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-zinc-100 last:border-b-0">
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
                      <p className="text-sm font-semibold text-zinc-800">
                        {row.name}
                      </p>
                      <p className="truncate text-xs text-zinc-400">{row.detail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-zinc-500">{row.time}</td>
                <td className="px-5 py-3.5 text-sm text-zinc-500">{row.location}</td>
                <td className="px-5 py-3.5">
                  <StatusCell status={row.status} label={row.statusLabel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm">
        <p className="text-zinc-400">
          Showing {rows.length} of 184 events today
        </p>
        <a href="#audit" className="font-medium text-nysc hover:underline">
          View Complete Audit Trail →
        </a>
      </div>
    </section>
  )
}
