import type { Metadata } from "next"

import { AdminShell } from "./_components/admin-shell"

export const metadata: Metadata = {
  title: "Admin Dashboard | NYSC Portal",
  description: "NYSC staff attendance overview and admin controls.",
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>
}
