"use client"

import {
  Building2,
  CalendarRange,
  Clock,
  Download,
  Printer,
  RotateCcw,
  Search,
  Timer,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  UserX,
} from "lucide-react"

import { FilterSelect } from "@/app/admin/_components/filter-select"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  ANOMALY_COUNT,
  directorates,
  periodRange,
  punctualityTrend,
  reportKpis,
  reportPeriods,
  stationFilters,
  statusFilters,
  type ReportPeriod,
  type ReportStaffRow,
  type ScoreBand,
} from "../_data"
import { useReports } from "../_hooks/use-reports"

const bandClass: Record<ScoreBand, string> = {
  Perfect: "bg-mint text-nysc-dark",
  Exemplary: "bg-mint text-nysc-green",
  High: "bg-nysc-muted text-nysc",
  Benchmark: "bg-surface-50 text-olive",
  Compliant: "bg-surface-50 text-slate",
  Deficient: "bg-danger-soft text-danger",
}

const kpiIcons = {
  punctuality: Timer,
  late: Clock,
  absent: UserX,
  overrides: TriangleAlert,
} as const

const staffColumns: DataTableColumn<ReportStaffRow>[] = [
  {
    id: "staff",
    header: "Staff",
    cell: (row) => (
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint text-[11px] font-semibold text-nysc-green">
          {row.initials}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{row.name}</p>
          <p className="text-xs text-slate">{row.staffId}</p>
        </div>
      </div>
    ),
  },
  {
    id: "station",
    header: "Station",
    className: "text-sm text-olive",
    cell: (row) => row.station,
  },
  {
    id: "days",
    header: "Days",
    className: "text-sm tabular-nums text-ink",
    cell: (row) => `${row.present}/${row.expected}`,
  },
  {
    id: "score",
    header: "Score",
    cell: (row) => (
      <span
        title={row.band}
        className={cn(
          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
          bandClass[row.band]
        )}
      >
        {row.score}%
      </span>
    ),
  },
  {
    id: "in",
    header: "In",
    cell: (row) => (
      <span
        className={cn(
          "text-sm tabular-nums",
          row.late ? "text-danger-muted" : "text-nysc-green"
        )}
      >
        {row.avgIn}
      </span>
    ),
  },
]

function PunctualityChart() {
  const width = 560
  const height = 120
  const min = 84
  const max = 100
  const points = punctualityTrend.map((point, index) => {
    const x = (index / (punctualityTrend.length - 1)) * width
    const y = height - ((point.value - min) / (max - min)) * height
    return { ...point, x, y }
  })
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
  const peak = points.reduce((best, point) =>
    point.value > best.value ? point : best
  )

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-28 w-full"
      role="img"
      aria-label="Daily punctuality trend"
    >
      <path
        d={line}
        className="fill-none stroke-nysc-green"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={peak.x} cy={peak.y} r="4" className="fill-nysc-dark" />
    </svg>
  )
}

export function ReportsPanel() {
  const {
    period,
    query,
    status,
    station,
    anomaliesOnly,
    page,
    filtered,
    setPeriod,
    setQuery,
    setStatus,
    setStation,
    setPage,
    showAnomalies,
    resetTable,
    exportCsv,
  } = useReports()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[32px] leading-none font-bold tracking-tight text-ink">
            Reports
          </h1>
          <p className="mt-1.5 text-sm text-olive-muted">{periodRange[period]}</p>
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            value={period}
            options={[...reportPeriods]}
            aria-label="Period"
            className="w-36 border-line"
            onChange={(value) => setPeriod(value as ReportPeriod)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Print"
            className="rounded-full border-line"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            aria-label="Export CSV"
            className="rounded-full bg-nysc-green text-white hover:bg-nysc-green/90"
            onClick={exportCsv}
          >
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-line/80 bg-white md:grid-cols-5">
        {reportKpis.map((kpi) => {
          const Icon = kpiIcons[kpi.id]
          return (
            <article
              key={kpi.id}
              className="flex items-center gap-3 border-b border-surface-200 px-4 py-4 md:border-r md:border-b-0 md:last:border-r-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-50 text-olive-muted">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[28px] leading-none font-bold tracking-tight text-ink">
                  {kpi.value}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-olive-muted">
                  {kpi.tone === "up" ? (
                    <TrendingUp className="size-3 text-nysc-green" />
                  ) : kpi.tone === "warn" ? (
                    <TrendingDown className="size-3 text-danger-muted" />
                  ) : null}
                  <span className="truncate">{kpi.label}</span>
                </p>
              </div>
            </article>
          )
        })}
        <button
          type="button"
          onClick={showAnomalies}
          className={cn(
            "flex items-center gap-3 px-4 py-4 text-left transition-colors",
            anomaliesOnly ? "bg-danger-soft" : "hover:bg-surface-50"
          )}
          aria-pressed={anomaliesOnly}
          aria-label="Show anomalies"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <TriangleAlert className="size-4" />
          </span>
          <div>
            <p className="text-[28px] leading-none font-bold tracking-tight text-danger">
              {ANOMALY_COUNT}
            </p>
            <p className="mt-1 text-[11px] text-danger-muted">Flagged</p>
          </div>
        </button>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-[20px] border border-line/80 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <CalendarRange className="size-4 text-olive-muted" />
              Trend
            </h2>
            <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-nysc-dark">
              {punctualityTrend[4].value}%
            </span>
          </div>
          <PunctualityChart />
        </section>

        <section className="rounded-[20px] border border-line/80 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <Building2 className="size-4 text-olive-muted" />
            Units
          </h2>
          <ul className="space-y-3">
            {directorates.map((item) => (
              <li key={item.name} className="flex items-center gap-3">
                <p className="min-w-0 flex-1 truncate text-sm text-ink">
                  {item.name}
                </p>
                {item.flag ? (
                  <TriangleAlert
                    className="size-3.5 shrink-0 text-danger-muted"
                    aria-label={item.flag}
                  />
                ) : null}
                <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">
                  {item.score.toFixed(0)}%
                </span>
                <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-surface-50">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      item.score >= 90 ? "bg-nysc-green" : "bg-danger-rose"
                    )}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <DataTable
        data={filtered}
        columns={staffColumns}
        getRowId={(row) => row.id}
        page={page}
        onPageChange={setPage}
        empty="No staff match these filters."
        noun="records"
        minWidthClass="min-w-180"
        toolbar={
          <div className="flex flex-wrap items-center gap-2 border-b border-surface-200 p-3">
            <span className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-10 rounded-full border-line pl-9 text-sm shadow-none"
              />
            </span>
            <FilterSelect
              value={status}
              options={[...statusFilters]}
              aria-label="Status"
              className="w-36 border-line"
              onChange={setStatus}
            />
            <FilterSelect
              value={station}
              options={[...stationFilters]}
              aria-label="Station"
              className="w-40 border-line"
              onChange={(value) => setStation(value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Reset filters"
              className="text-olive-muted"
              onClick={resetTable}
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        }
      />
    </div>
  )
}
