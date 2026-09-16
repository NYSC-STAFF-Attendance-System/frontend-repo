import { weeklyTrend } from "../_data"

const maxValue = Math.max(...weeklyTrend.map((day) => day.value))

export function WeeklyTrend() {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              Weekly Attendance Trend
            </h2>
            <span className="rounded-full bg-nysc-muted px-2 py-0.5 text-[11px] font-semibold text-nysc">
              Avg 92.4%
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Summary of HQ Secretariat and Regional State Offices
          </p>
        </div>
        <a
          href="#report"
          className="text-sm font-medium text-nysc hover:underline"
        >
          View Full Report →
        </a>
      </div>

      <div className="mt-5 rounded-xl bg-zinc-50 px-3 pt-4 pb-0 sm:px-6">
        <div className="flex h-48 items-end gap-3 sm:gap-5">
          {weeklyTrend.map((day) => {
            const height = Math.round((day.value / (maxValue + 12)) * 148)
            return (
              <div
                key={day.label}
                className="flex min-w-0 flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 text-sm font-medium text-zinc-500">
                  {day.value}
                </span>
                <div
                  className="w-full max-w-[64px] rounded-t-sm bg-[#2f9e57]"
                  style={{ height: `${height}px` }}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-3 flex gap-3 px-3 sm:gap-5 sm:px-6">
        {weeklyTrend.map((day) => (
          <p
            key={day.label}
            className="min-w-0 flex-1 text-center text-xs text-zinc-400"
          >
            {day.label}
          </p>
        ))}
      </div>
    </section>
  )
}
