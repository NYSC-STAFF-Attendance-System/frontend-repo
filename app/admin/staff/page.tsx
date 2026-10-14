import type { Metadata } from "next"

import { StaffApprovals } from "./_components/staff-approvals"

export const metadata: Metadata = {
  title: "Registration Approvals | NYSC Portal",
  description: "Review and manage pending staff account requests.",
}

export default function StaffPage() {
  return <StaffApprovals />
}
