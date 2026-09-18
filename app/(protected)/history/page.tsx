"use client";

import { HISTORY_PERIODS, useHistory } from "./use-history";
import { Screen } from "@/components/screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { formatDayLabel, timeFromIso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttendanceDay, AttendanceStatistics } from "@/types";

/**
 * /history - the staff member's own attendance record.
 *
 * Every figure on this screen is calculated by the backend. Nothing here sums
 * days, works out a percentage or averages a time. Two implementations of the
 * same arithmetic would drift, and the server holds the version that appears in
 * admin reports.
 */
export default function HistoryPage() {
  const { period, state, selectPeriod, retry } = useHistory();

  return (
    <Screen className="gap-5">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Your attendance</h1>
      </header>

      {/* A group of toggle buttons, not role="tablist". The ARIA tabs pattern
          requires a tabpanel, roving focus and arrow-key navigation; these
          filters have none of that, and claiming the role would make a screen
          reader promise behaviour that is not there.

          Horizontally scrollable so the row never forces the page wider than
          the screen on a narrow phone. */}
      <div role="group" aria-label="Period" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {HISTORY_PERIODS.map((option) => {
          const selected = option.value === period;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => selectPeriod(option.value)}
              className={cn(
                "h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {state.name === "loading" ? <LoadingState label="Loading your records" /> : null}

      {state.name === "error" ? (
        <ErrorState message={state.message} onRetry={retry} />
      ) : null}

      {state.name === "ready" ? (
        state.days.length === 0 ? (
          <EmptyState
            title="No attendance yet"
            message="Once you scan the code at your office, your days will appear here."
          />
        ) : (
          <>
            <Statistics statistics={state.statistics} />
            <ol className="flex flex-col gap-2">
              {state.days.map((day) => (
                <DayRow key={day.id} day={day} />
              ))}
            </ol>
          </>
        )
      ) : null}
    </Screen>
  );
}

function Statistics({ statistics }: { statistics: AttendanceStatistics }) {
  return (
    <section aria-label="Summary" className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Tile label="Days present" value={String(statistics.daysPresent)} />
        <Tile label="Days absent" value={String(statistics.daysAbsent)} />
        <Tile label="Late arrivals" value={String(statistics.lateArrivals)} />
        <Tile label="Attendance" value={`${statistics.attendancePercentage}%`} />
      </div>

      <dl className="divide-y divide-border rounded-lg border border-border text-sm">
        <Row label="Average arrival" value={statistics.averageArrivalTime ?? "—"} />
        <Row label="Average departure" value={statistics.averageDepartureTime ?? "—"} />
        <Row label="Early departures" value={String(statistics.earlyDepartures)} />
        <Row label="Days in a row present" value={String(statistics.consecutiveDaysPresent)} />
      </dl>
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

function DayRow({ day }: { day: AttendanceDay }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{formatDayLabel(day.date)}</p>
          <p className="text-xs text-muted-foreground">{day.officeName}</p>
        </div>
        <StatusBadge status={day.status} />
      </div>

      <dl className="flex gap-8">
        <div>
          <dt className="text-xs text-muted-foreground">Sign in</dt>
          <dd className="text-sm font-medium text-foreground tabular-nums">
            {day.signInAt ? timeFromIso(day.signInAt) : "—"}
            {/* The server works out how late; this only renders the number. */}
            {day.minutesLate ? (
              <span className="ml-1 text-warning">+{day.minutesLate}m</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Sign out</dt>
          <dd className="text-sm font-medium text-foreground tabular-nums">
            {day.signOutAt ? timeFromIso(day.signOutAt) : "—"}
          </dd>
        </div>
      </dl>
    </li>
  );
}
