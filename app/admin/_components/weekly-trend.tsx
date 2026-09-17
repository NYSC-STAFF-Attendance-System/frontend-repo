import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { weeklyTrend } from "../_data"

const PLOT_HEIGHT = 184
const SCALE_MAX = 210

export function WeeklyTrend() {
  return (
    <section className="rounded-[20px] border border-line/80 bg-white px-6 pt-6 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-[20px] leading-none font-bold tracking-tight text-ink">
              Weekly Attendance Trend
            </h2>
            <span className="rounded-full bg-mint px-2.5 py-0.75 text-[12px] font-semibold text-nysc-dark">
              Avg 92.4%
            </span>
          </div>
          <p className="mt-2 text-[13px] text-olive">
            Summary of HQ Secretariat and Regional State Offices
          </p>
        </div>
        <a
          href="#report"
          className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[14px] font-medium text-nysc-green hover:underline"
        >
          View Full Report
          <ArrowRight className="size-3.5" strokeWidth={2.2} />
        </a>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-[14px] bg-surface-50 px-4 pt-5 sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-5 bottom-0 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border-t border-surface-300" />
          ))}
        </div>

        <div className="relative flex h-49 items-end">
          {weeklyTrend.map((day, index) => {
            const isToday = index === weeklyTrend.length - 1
            const barHeight = (day.value / SCALE_MAX) * PLOT_HEIGHT

            return (
              <div
                key={day.label}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <span className="mb-2 text-[13px] font-medium tabular-nums text-slate">
                  {day.value}
                </span>
                <div
                  className={cn(
                    "w-15 rounded-t-2 sm:w-18",
                    isToday ? "bg-nysc-mid" : "bg-nysc-green"
                  )}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-3.5 flex px-4 sm:px-8">
        {weeklyTrend.map((day, index) => {
          const isToday = index === weeklyTrend.length - 1

          return (
            <p
              key={day.label}
              className={cn(
                "min-w-0 flex-1 text-center text-[13px] whitespace-nowrap",
                isToday
                  ? "font-semibold text-nysc-mid"
                  : "font-medium text-slate"
              )}
            >
              {day.label}
            </p>
          )
        })}
      </div>
    </section>
  )
}
