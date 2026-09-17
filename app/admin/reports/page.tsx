import type { Metadata } from "next"

import { ReportsPanel } from "./_components/reports-panel"

export const metadata: Metadata = {
  title: "Reports | NYSC Portal",
  description: "Attendance punctuality, directorate compliance, and staff scores.",
}

export default function ReportsPage() {
  return <ReportsPanel />
}
