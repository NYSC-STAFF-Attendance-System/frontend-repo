"use client"

import { useState } from "react"
import Image from "next/image"
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  ClipboardList,
  Clock,
  Download,
  Eye,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { FilterSelect } from "@/app/admin/_components/filter-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { InviteAdminPanel } from "./invite-admin"
import { useStaffApprovals } from "../_hooks/use-staff-approvals"
import {
  departmentTone,
  type ApprovalRequest,
  type Department,
  type Office,
} from "../_data"

const departments: Department[] = ["Administration", "ICT", "Finance"]
const offices: Office[] = ["HQ - Abuja", "Zone B Office", "Zone C Office"]

const avatarClass = {
  green: "bg-emerald-100 text-nysc",
  gray: "bg-zinc-200 text-zinc-600",
} as const

function ProfileAvatar({ staff }: { staff: ApprovalRequest }) {
  const [failed, setFailed] = useState(false)
  const photo = staff.photo

  if (staff.avatar === "photo" && photo && !failed) {
    return (
      <Image
        src={photo}
        alt={staff.name}
        width={40}
        height={40}
        className="size-10 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-xs font-semibold",
        avatarClass[staff.avatar === "gray" ? "gray" : "green"]
      )}
    >
      {staff.initials}
    </span>
  )
}

export function StaffApprovals() {
  const {
    queue,
    approvedToday,
    query,
    department,
    office,
    setQuery,
    setDepartment,
    setOffice,
    setPage,
    visible,
    currentPage,
    pageCount,
    showingFrom,
    showingTo,
    filtered,
    removeFromQueue,
    exportList,
  } = useStaffApprovals()

  return (
    <div className="flex flex-col gap-6">
      <InviteAdminPanel />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-[26px] leading-tight font-bold tracking-tight text-zinc-900 sm:text-[32px]">
            Registration Approvals
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Review and manage pending staff account requests. Approve credentials
            to grant portal access.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportList}
          className="h-10 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700 shadow-none"
        >
          <Download data-icon="inline-start" className="size-4" />
          Export List
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_280px]">
        <article className="rounded-2xl border border-zinc-200/80 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase">
                Total Pending
              </p>
              <p className="mt-3 text-[32px] leading-none font-semibold tracking-tight text-zinc-900 sm:text-[40px]">
                {queue.length}
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <ClipboardList className="size-5" />
            </span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-red-500">
            <Clock className="size-3.5" />
            Requires action
          </p>
        </article>

        <article className="rounded-2xl border border-zinc-200/80 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase">
                Requests Today
              </p>
              <p className="mt-3 text-[32px] leading-none font-semibold tracking-tight text-zinc-900 sm:text-[40px]">
                4
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <Calendar className="size-5" />
            </span>
          </div>
          <p className="mt-4 text-sm text-zinc-400">+2 since 08:00 AM</p>
        </article>

        <article className="rounded-2xl border border-zinc-200/80 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase">
                Approved Today
              </p>
              <p className="mt-3 text-[32px] leading-none font-semibold tracking-tight text-nysc sm:text-[40px]">
                {approvedToday}
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-nysc">
              <BadgeCheck className="size-5" />
            </span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-nysc">
            <ArrowRight className="size-3.5 -rotate-45" />
            Avg. 14 mins
          </p>
        </article>

        <article className="rounded-2xl bg-[#148a47] p-5 text-white shadow-[0_8px_24px_rgba(20,138,71,0.18)]">
          <h2 className="text-xl font-semibold">Clear Queue</h2>
          <p className="mt-1 text-sm text-white/80">
            {queue.length} items awaiting review
          </p>
          <Button
            className="mt-6 h-9 rounded-lg bg-white px-4 text-nysc hover:bg-white/90"
            onClick={() => {
              document.getElementById("approvals-table")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }}
          >
            Review
            <ArrowRight data-icon="inline-end" className="size-4" />
          </Button>
        </article>
      </section>

      <section
        id="approvals-table"
        className="overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white"
      >
        <div className="flex flex-col gap-3 px-3 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search by name or ID..."
              className="h-10 rounded-full border-zinc-200 bg-white pl-10 text-sm shadow-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              value={department}
              onChange={(value) => {
                setDepartment(value)
                setPage(1)
              }}
              aria-label="Filter Department"
              className="w-full min-w-0 rounded-xl sm:w-auto sm:min-w-40"
              options={[
                { value: "all", label: "Filter Department" },
                ...departments,
              ]}
            />
            <FilterSelect
              value={office}
              onChange={(value) => {
                setOffice(value)
                setPage(1)
              }}
              aria-label="Filter Office"
              className="w-full min-w-0 rounded-xl sm:w-auto sm:min-w-40"
              options={[
                { value: "all", label: "Filter Office" },
                ...offices,
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-240 text-left">
            <thead>
              <tr className="border-y border-zinc-100 text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase">
                <th className="px-5 py-3 font-semibold">Profile</th>
                <th className="px-5 py-3 font-semibold">Staff Details</th>
                <th className="px-5 py-3 font-semibold">
                  Department &amp; Office
                </th>
                <th className="px-5 py-3 font-semibold">Reg. Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-sm text-zinc-400"
                  >
                    No pending registrations match these filters.
                  </td>
                </tr>
              ) : (
                visible.map((staff) => (
                  <tr key={staff.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="px-5 py-4">
                      <ProfileAvatar staff={staff} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-800">
                        {staff.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">{staff.staffId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-sm text-zinc-600">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            departmentTone[staff.department]
                          )}
                        />
                        {staff.department}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                        <MapPin className="size-3" />
                        {staff.office}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-500">
                      <p>{staff.registeredOn}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {staff.registeredAt}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
                        <span className="size-1.5 rounded-full bg-rose-400" />
                        Pending Review
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-zinc-400 hover:text-zinc-700"
                          aria-label={`View ${staff.name}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 px-3 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => removeFromQueue(staff.id, "reject")}
                        >
                          Reject
                        </Button>
                        <Button
                          className="h-8 rounded-lg bg-nysc px-3 text-sm text-white hover:bg-nysc/90"
                          onClick={() => removeFromQueue(staff.id, "approve")}
                        >
                          Approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm text-zinc-400">
            Showing {showingFrom} to {showingTo} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-zinc-400"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  size="icon-sm"
                  variant={pageNumber === currentPage ? "default" : "ghost"}
                  className={cn(
                    "size-8 text-sm",
                    pageNumber === currentPage
                      ? "bg-nysc text-white hover:bg-nysc/90"
                      : "text-zinc-500"
                  )}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-zinc-400"
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
  )
}
