import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AttendanceCorrection } from "../../_components/attendance-correction"
import { getAttendanceById } from "../../_data"

export async function generateMetadata({
  params,
}: PageProps<"/admin/attendance/[id]/correct">): Promise<Metadata> {
  const { id } = await params
  const record = getAttendanceById(id)

  return {
    title: record
      ? `${record.name} | Record Correction`
      : "Record Correction | NYSC Portal",
    description: "Apply an authorized correction to a staff attendance record.",
  }
}

export default async function AttendanceCorrectionPage({
  params,
}: PageProps<"/admin/attendance/[id]/correct">) {
  const { id } = await params
  const record = getAttendanceById(id)

  if (!record) {
    notFound()
  }

  return <AttendanceCorrection record={record} />
}
