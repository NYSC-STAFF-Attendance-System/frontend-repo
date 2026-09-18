"use client"

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Search,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react"

import { FilterSelect } from "@/app/admin/_components/filter-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  actionOptions,
  dateOptions,
  moduleOptions,
  roleOptions,
  type AuditAction,
  type AuditEvent,
  type AuditRole,
} from "../_data"
import { useAuditLog } from "../_hooks/use-audit-log"
import { AuditEventDrawer } from "./audit-event-drawer"

const actionTone: Record<AuditAction, string> = {
  "Attendance Corrected": "text-rose-500",
  "Staff Checked In": "text-nysc",
  "Staff Checked Out": "text-nysc",
  "Registration Approved": "text-nysc",
  "Attendance Settings Changed": "text-zinc-600",
  "Staff Account Created": "text-nysc",
}

const roleClass: Record<AuditRole, string> = {
  Administrator: "bg-nysc text-white",
  Staff: "bg-zinc-100 text-zinc-600",
  System: "bg-zinc-800 text-white",
}

function pageNumbers(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  if (current <= 3) return [1, 2, 3, "ellipsis", total]
  if (current >= total - 2) return [1, "ellipsis", total - 2, total - 1, total]
  return [1, "ellipsis", current, "ellipsis", total]
}

export function AuditLog() {
  const {
    query,
    date,
    module,
    action,
    role,
    filtered,
    attendanceCount,
    adminCount,
    attendanceShare,
    visible,
    currentPage,
    pageCount,
    showingFrom,
    showingTo,
    selectedId,
    selectedDetail,
    chips,
    setQuery,
    setDate,
    setModule,
    setAction,
    setRole,
    setPage,
    setSelectedId,
    resetFilters,
    exportCsv,
  } = useAuditLog()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[32px] leading-none font-bold tracking-tight text-zinc-900">
            Audit Log
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Review important actions and changes made in the attendance system.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={exportCsv}
          className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
        >
          <Download data-icon="inline-start" className="size-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Today's Events"
          value={filtered.length}
          hint="All recorded system and user events"
          icon={Shield}
        />
        <StatCard
          label="Attendance Events"
          value={attendanceCount}
          hint={`${attendanceShare}% check-ins, check-outs, and corrections`}
          icon={ClipboardList}
        />
        <StatCard
          label="Administrative Changes"
          value={adminCount}
          hint="Manual adjustments, registrations, and policy changes"
          icon={Settings}
          tone="rose"
        />
      </div>

      <section className="rounded-[20px] border border-zinc-200/80 bg-white">
        <div className="grid gap-3 border-b border-zinc-100 p-5 sm:grid-cols-2 lg:grid-cols-5">
          <span className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search user or record..."
              className="h-10 rounded-full border-zinc-200 pl-9 text-sm shadow-none"
            />
          </span>
          <FilterSelect
            value={date}
            options={[...dateOptions]}
            aria-label="Date"
            onChange={(value) => {
              setDate(value)
              setPage(1)
            }}
          />
          <FilterSelect
            value={module}
            options={[...moduleOptions]}
            aria-label="Module"
            onChange={(value) => {
              setModule(value)
              setPage(1)
            }}
          />
          <FilterSelect
            value={action}
            options={[...actionOptions]}
            aria-label="Action"
            onChange={(value) => {
              setAction(value)
              setPage(1)
            }}
          />
          <FilterSelect
            value={role}
            options={[...roleOptions]}
            aria-label="Role"
            onChange={(value) => {
              setRole(value)
              setPage(1)
            }}
          />
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 px-5 py-3">
            <span className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              Active
            </span>
            {chips.map((chip) => (
              <span
                key={chip.key}
                className="rounded-full bg-nysc-muted px-2.5 py-1 text-xs font-medium text-nysc"
              >
                {chip.label}
              </span>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-nysc hover:underline"
            >
              <X className="size-3.5" />
              Reset Filters
            </button>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-220 text-left">
            <thead>
              <tr className="border-y border-zinc-100 text-[11px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                <th className="px-5 py-3 font-semibold">Date & Time</th>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Module</th>
                <th className="px-5 py-3 font-semibold">Affected Record</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-sm text-zinc-400"
                  >
                    No audit events match these filters.
                  </td>
                </tr>
              ) : (
                visible.map((event) => (
                  <AuditRow
                    key={event.id}
                    event={event}
                    active={event.id === selectedId}
                    onOpen={() => setSelectedId(event.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm text-zinc-400">
            Showing{" "}
            <span className="font-semibold text-zinc-700">{showingFrom}</span> to{" "}
            <span className="font-semibold text-zinc-700">{showingTo}</span> of{" "}
            <span className="font-semibold text-zinc-700">{filtered.length}</span>{" "}
            audit events
          </p>
          <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-none text-zinc-400"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {pageNumbers(currentPage, pageCount).map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex size-8 items-center justify-center text-sm text-zinc-400"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={item}
                  size="icon-sm"
                  variant="ghost"
                  className={cn(
                    "size-8 rounded-none text-sm",
                    item === currentPage
                      ? "bg-nysc text-white hover:bg-nysc/90 hover:text-white"
                      : "text-zinc-500"
                  )}
                  onClick={() => setPage(item)}
                >
                  {item}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-none text-zinc-400"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      <Sheet
        open={selectedDetail !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <SheetContent
          showCloseButton={false}
          className="gap-0 rounded-l-[20px] border-line p-0 data-[side=right]:sm:max-w-md"
        >
          {selectedDetail ? <AuditEventDrawer detail={selectedDetail} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "green",
}: {
  label: string
  value: number
  hint: string
  icon: typeof Shield
  tone?: "green" | "rose"
}) {
  return (
    <div className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
            {label}
          </p>
          <p className="mt-2 text-[32px] leading-none font-bold tracking-tight text-zinc-900">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            tone === "rose" ? "bg-rose-50 text-rose-500" : "bg-nysc-muted text-nysc"
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-400">{hint}</p>
    </div>
  )
}

function AuditRow({
  event,
  active,
  onOpen,
}: {
  event: AuditEvent
  active: boolean
  onOpen: () => void
}) {
  return (
    <tr
      className={cn(
        "cursor-pointer border-b border-zinc-100 last:border-b-0 hover:bg-surface-50",
        active && "bg-mint/40"
      )}
      onClick={onOpen}
      onKeyDown={(keyboard) => {
        if (keyboard.key === "Enter" || keyboard.key === " ") {
          keyboard.preventDefault()
          onOpen()
        }
      }}
      tabIndex={0}
      aria-label={`Open audit event ${event.recordCode}`}
    >
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-zinc-800">{event.date}</p>
        <p className="mt-0.5 text-xs text-zinc-400">{event.time}</p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nysc-muted text-[11px] font-semibold text-nysc">
            {event.initials}
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-800">{event.user}</p>
            <p className="text-xs text-zinc-400">{event.userId}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
            roleClass[event.role]
          )}
        >
          {event.role}
        </span>
      </td>
      <td className="px-5 py-4">
        <p className={cn("text-sm font-medium", actionTone[event.action])}>
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
          {event.action}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
          {event.module === "Staff" ? (
            <Users className="size-3.5 text-zinc-400" />
          ) : event.module === "Settings" ? (
            <Settings className="size-3.5 text-zinc-400" />
          ) : (
            <ClipboardList className="size-3.5 text-zinc-400" />
          )}
          {event.module}
        </span>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-zinc-800">{event.recordCode}</p>
        <p className="mt-0.5 text-xs text-zinc-400">{event.recordDetail}</p>
      </td>
    </tr>
  )
}
