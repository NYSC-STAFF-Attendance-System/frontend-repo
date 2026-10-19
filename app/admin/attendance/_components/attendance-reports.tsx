"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MapPin,
  RotateCcw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import { FilterSelect } from "@/app/admin/_components/filter-select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/states";
import { dateRanges, type AttendanceRecord, type AttendanceStatus } from "../_data";
import { useAttendanceReports } from "../_hooks/use-attendance-reports";

const periods = [
  { value: "All", label: "All" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Exceptions", label: "Exceptions" },
] as const;

const statusClass: Record<AttendanceStatus, string> = {
  present: "bg-emerald-50 text-nysc",
  late: "bg-amber-50 text-amber-600",
  absent: "bg-rose-50 text-rose-500",
  "checked-out": "bg-emerald-100 text-nysc",
  incomplete: "bg-amber-50 text-amber-600",
};

const avatarClass = {
  green: "bg-emerald-100 text-nysc",
  gray: "bg-zinc-200 text-zinc-600",
  mint: "bg-emerald-50 text-nysc",
} as const;

function ProfileAvatar({ record }: { record: AttendanceRecord }) {
  const [failed, setFailed] = useState(false);
  const photo = record.photo;

  if (record.avatar === "photo" && photo && !failed) {
    return (
      <Image
        src={photo}
        alt={record.name}
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        avatarClass[record.avatar === "photo" ? "gray" : record.avatar],
      )}
    >
      {record.initials}
    </span>
  );
}

export function AttendanceReports() {
  const {
    period,
    dateRange,
    query,
    loading,
    loadError,
    visible,
    total,
    currentPage,
    pageCount,
    showingFrom,
    showingTo,
    chips,
    pageItems,
    setPeriod,
    setDateRange,
    setQuery,
    setPage,
    resetFilters,
    exportData,
  } = useAttendanceReports();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] leading-tight font-bold tracking-tight text-zinc-900 sm:text-[32px]">
            Attendance Reports
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Search a person, then narrow by time, place, or GPS.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void exportData("xlsx")}
            className="h-11 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700"
          >
            <Download data-icon="inline-start" className="size-4" />
            Excel
          </Button>
          <Button
            onClick={() => void exportData("csv")}
            className="h-11 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90"
          >
            <Download data-icon="inline-start" className="size-4" />
            CSV
          </Button>
        </div>
      </div>

      <section className="rounded-[20px] border border-zinc-200/80 bg-white">
        <div className="space-y-3 border-b border-zinc-100 p-3 sm:p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Staff ID"
              className="h-10 rounded-full border-zinc-200 pl-10 text-sm shadow-none"
              aria-label="Staff ID"
            />
          </label>

          <div className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-5 sm:overflow-visible">
            {periods.map((item) => (
              <button
                key={item.value}
                type="button"
                title={item.value}
                onClick={() => setPeriod(item.value)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap sm:min-w-0 sm:flex-1 sm:truncate sm:px-1 sm:text-sm",
                  period === item.value
                    ? "bg-nysc-dark text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="max-w-xs">
            <FilterSelect
              value={dateRange}
              options={[...dateRanges]}
              aria-label="Date range"
              onChange={setDateRange}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <p className="mr-1 text-sm text-zinc-500">
                <span className="font-semibold text-zinc-800">
                  {total}
                </span>{" "}
                {total === 1 ? "record" : "records"}
              </p>
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={chip.onClear}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-nysc-muted px-2.5 py-1 text-xs font-medium text-nysc"
                >
                  <span className="truncate">{chip.label}</span>
                  <X className="size-3 shrink-0" />
                  <span className="sr-only">Remove {chip.label} filter</span>
                </button>
              ))}
            </div>
            {chips.length > 0 ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-nysc hover:underline"
              >
                <RotateCcw className="size-3.5" />
                Clear all
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-245 text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase">
                <th className="px-3 py-3 font-semibold whitespace-nowrap sm:px-4">
                  Staff Member
                </th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap sm:px-4">
                  Staff ID
                </th>
                <th className="px-3 py-3 font-semibold sm:px-4">
                  Office &amp; state
                </th>
                <th className="px-3 py-3 font-semibold sm:px-4">Date</th>
                <th className="px-3 py-3 font-semibold sm:px-4">Check-In</th>
                <th className="px-3 py-3 font-semibold sm:px-4">Check-Out</th>
                <th className="px-3 py-3 font-semibold sm:px-4">Status</th>
                <th className="px-3 py-3 text-right font-semibold sm:px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 sm:px-4">
                    <LoadingState label="Loading attendance" />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-16 text-center text-sm text-zinc-400 sm:px-4"
                  >
                    {loadError ?? "No attendance records match these filters."}
                  </td>
                </tr>
              ) : (
                visible.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    <td className="px-3 py-4 whitespace-nowrap sm:px-4">
                      <Link
                        href={`/admin/attendance/${record.id}`}
                        className="flex items-center gap-3"
                      >
                        <ProfileAvatar record={record} />
                        <div>
                          <p className="text-sm leading-5 font-semibold whitespace-nowrap text-zinc-800 hover:text-nysc">
                            {record.name}
                          </p>
                          {record.gps === "outside" ? (
                            <p className="mt-1 rounded-md bg-rose-50 px-2 py-1 text-[10px] leading-3 font-medium whitespace-nowrap text-rose-500">
                              <TriangleAlert className="mr-1 inline size-3" />
                              GPS ({record.gpsDistanceM}m)
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-sm leading-5 font-medium whitespace-nowrap text-zinc-600 sm:px-4">
                      {record.staffId}
                    </td>
                    <td className="px-3 py-4 sm:px-4">
                      <p className="text-sm font-medium whitespace-nowrap text-zinc-700">
                        {record.department}
                      </p>
                      <p className="mt-0.5 text-xs whitespace-nowrap text-zinc-400">
                        {record.location}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-sm leading-5 whitespace-nowrap text-zinc-500 sm:px-4">
                      {record.date}
                    </td>
                    <td className="px-3 py-4 sm:px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-sm font-medium whitespace-nowrap",
                            record.status === "late"
                              ? "text-orange-500"
                              : "text-zinc-600",
                          )}
                        >
                          {record.checkIn ?? "-- : --"}
                        </span>
                        {record.gps === "match" ? (
                          <MapPin className="size-3.5 text-nysc" />
                        ) : null}
                        {record.gps === "outside" ? (
                          <MapPin className="size-3.5 text-rose-400" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-zinc-500 sm:px-4">
                      {record.checkOut ?? "-- : --"}
                    </td>
                    <td className="px-3 py-4 sm:px-4">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
                          statusClass[record.status],
                        )}
                      >
                        {record.statusLabel}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right sm:px-4">
                      <Link
                        href={`/admin/attendance/${record.id}`}
                        aria-label={`View ${record.name}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon-sm",
                          className: "text-zinc-400 hover:text-zinc-700",
                        })}
                      >
                        <Eye className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm text-zinc-400">
            Showing{" "}
            <span className="font-semibold text-zinc-700">{showingFrom}</span>{" "}
            to <span className="font-semibold text-zinc-700">{showingTo}</span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-700">
              {total}
            </span>{" "}
            entries
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
            {pageItems.map((item, index) =>
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
                    "rounded-none size-8 text-sm",
                    item === currentPage
                      ? "bg-nysc text-white hover:bg-nysc/90 hover:text-white"
                      : "text-zinc-500",
                  )}
                  onClick={() => setPage(item)}
                >
                  {item}
                </Button>
              ),
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
    </div>
  );
}
