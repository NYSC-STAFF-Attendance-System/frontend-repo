import type { Metadata } from "next"

import { AuditLog } from "./_components/audit-log"

export const metadata: Metadata = {
  title: "Audit Log | NYSC Portal",
  description: "Review important actions and changes in the attendance system.",
}

export default function AuditLogPage() {
  return <AuditLog />
}
