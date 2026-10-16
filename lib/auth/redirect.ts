/**
 * Safe post-login destinations.
 *
 * The redirect query is written by the auth guards when a signed-out visitor
 * opens a real route. Only same-app paths are honoured, so a crafted
 * ?redirect=https://… cannot send anyone off this origin.
 *
 * Staff and admins sign in at different pages, and each page only returns its
 * own kind of route. A staff sign-in never lands in /admin, and an admin
 * sign-in never lands in the attendance app.
 */

const BLOCKED_PREFIXES = [
  "/login",
  "/admin/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function currentPath(pathname: string, search: string): string {
  return `${pathname}${search}`;
}

/** Staff sign-in, returning to `from` afterwards. */
export function loginHref(from: string): string {
  return `/login?redirect=${encodeURIComponent(from)}`;
}

/** Admin sign-in, returning to `from` afterwards. */
export function adminLoginHref(from: string): string {
  return `/admin/login?redirect=${encodeURIComponent(from)}`;
}

export function safeRedirect(value: string | null | undefined): string | null {
  if (!value) return null;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("://")) {
    return null;
  }
  if (
    BLOCKED_PREFIXES.some(
      (prefix) =>
        decoded === prefix ||
        decoded.startsWith(`${prefix}/`) ||
        decoded.startsWith(`${prefix}?`),
    )
  ) {
    return null;
  }
  return decoded;
}

function isAdminPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/") || path.startsWith("/admin?");
}

export function isAdminRole(role: string): boolean {
  return role === "admin" || role === "super_admin";
}

/** Where a staff sign-in goes: the page they asked for, or /home. */
export function staffDestination(redirect: string | null): string {
  const requested = safeRedirect(redirect);
  return requested && !isAdminPath(requested) ? requested : "/home";
}

/** Where an admin sign-in goes: the dashboard page they asked for, or /admin. */
export function adminDestination(redirect: string | null): string {
  const requested = safeRedirect(redirect);
  return requested && isAdminPath(requested) ? requested : "/admin";
}
