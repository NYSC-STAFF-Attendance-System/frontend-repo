import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminGuard } from "@/components/auth-provider"
import { LoadingState } from "@/components/states"
import { AdminShell } from "./_components/admin-shell"

export const metadata: Metadata = {
  title: "Admin Dashboard | NYSC Portal",
  description: "NYSC staff attendance overview and admin controls.",
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-page">
          <LoadingState label="Checking your account" />
        </div>
      }
    >
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </Suspense>
  )
}
