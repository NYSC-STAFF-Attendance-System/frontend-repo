import type { Metadata } from "next"

import { AttendanceReports } from "./_components/attendance-reports"

export const metadata: Metadata = {
  title: "Attendance Reports | NYSC Portal",
  description: "Review staff attendance records, exceptions, and GPS checks.",
}

export default function AttendancePage() {
  return <AttendanceReports />
}
