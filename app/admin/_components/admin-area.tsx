"use client";

import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/auth-provider";
import { SnackbarProvider } from "@/components/snackbar";
import { AdminShell } from "./admin-shell";

/**
 * Decides whether an /admin page gets the guard and the dashboard chrome.
 *
 * Every page under app/admin shares one layout, and that layout guards the
 * whole tree. /admin/login is the exception: guarding it would send a signed-out
 * visitor to the login page, which would send them to the login page, forever.
 * It also must not show the sidebar and header of a dashboard they cannot use
 * yet.
 *
 * Done here, rather than by moving the login page out of app/admin, so its
 * address stays /admin/login and none of the dashboard pages have to move.
 */
export function AdminArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const body =
    pathname === "/admin/login" ? (
      children
    ) : (
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    );

  return <SnackbarProvider>{body}</SnackbarProvider>;
}
