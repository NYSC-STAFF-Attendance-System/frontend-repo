/**
 * Safe post-login destinations.
 *
 * The redirect query is written by the auth guards when a signed-out visitor
 * opens a real route. Only same-app paths are honoured, so a crafted
 * ?redirect=https://… cannot send anyone off this origin.
 */

const BLOCKED_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function currentPath(pathname: string, search: string): string {
  return `${pathname}${search}`;
}

export function loginHref(from: string): string {
  return `/login?redirect=${encodeURIComponent(from)}`;
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
  if (BLOCKED_PREFIXES.some((prefix) => decoded === prefix || decoded.startsWith(`${prefix}/`) || decoded.startsWith(`${prefix}?`))) {
    return null;
  }
  return decoded;
}

export function isAdminRole(role: string): boolean {
  return role === "admin" || role === "super_admin";
}

export function destinationAfterLogin(input: {
  role: string;
  usedEmail: boolean;
  redirect: string | null;
}): string {
  const requested = safeRedirect(input.redirect);
  if (requested) return requested;
  return input.usedEmail && isAdminRole(input.role) ? "/admin" : "/home";
}
