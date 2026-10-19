import type { Metadata } from "next"

import { AttendanceRecordView } from "../_components/attendance-record-view"

export const metadata: Metadata = {
  title: "Attendance Details | NYSC Portal",
  description: "Review one attendance record from the dashboard list.",
}

export default async function AttendanceDetailPage({
  params,
}: PageProps<"/admin/attendance/[id]">) {
  const { id } = await params
  return <AttendanceRecordView id={id} />
}
