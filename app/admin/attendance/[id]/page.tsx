import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AttendanceDetails } from "../_components/attendance-details"
import { getAttendanceById } from "../_data"

export async function generateMetadata({
  params,
}: PageProps<"/admin/attendance/[id]">): Promise<Metadata> {
  const { id } = await params
  const record = getAttendanceById(id)

  return {
    title: record
      ? `${record.name} | Attendance Details`
      : "Attendance Details | NYSC Portal",
    description: "Review GPS, device, and checkpoint metadata for a staff attendance record.",
  }
}

export default async function AttendanceDetailPage({
  params,
}: PageProps<"/admin/attendance/[id]">) {
  const { id } = await params
  const record = getAttendanceById(id)

  if (!record) {
    notFound()
  }

  return <AttendanceDetails record={record} />
}
