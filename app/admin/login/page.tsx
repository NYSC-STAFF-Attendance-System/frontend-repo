import type { Metadata } from "next";
import { AdminLoginView } from "./admin-login-view";

export const metadata: Metadata = {
  title: "Admin sign in | NYSC Portal",
  description: "Sign in to the NYSC staff attendance admin dashboard.",
};

/**
 * /admin/login
 *
 * Lives under /admin so the address reads naturally, but it is deliberately
 * left unguarded and without the dashboard chrome - see AdminArea in
 * app/admin/_components/admin-area.tsx. The admin layout already provides the
 * Suspense boundary that useSearchParams in the view needs.
 */
export default function AdminLoginPage() {
  return <AdminLoginView />;
}
