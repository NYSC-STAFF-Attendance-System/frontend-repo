import type { Metadata } from "next"
import { Suspense } from "react"

import { LoadingState } from "@/components/states"
import { AdminArea } from "./_components/admin-area"

/**
 * Admin lives under `/admin/*` so printed office QR posters can keep `/scan`
 * forever. Staff never share this tree: `AdminGuard` sends signed-out visitors
 * to /admin/login, and uninvited staff get a 404 (the dashboard is not
 * advertised). `AdminArea` leaves /admin/login itself unguarded.
 *
 * Pages in this folder own content only. Chrome (sidebar, header, mobile drawer)
 * is `AdminShell`. Filters that should be shareable live in the query string via
 * `useQueryFilters` — do not mirror them in React state.
 *
 * Suspense is required: `AdminGuard` and header search read `useSearchParams`.
 */
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
      <AdminArea>{children}</AdminArea>
    </Suspense>
  )
}
