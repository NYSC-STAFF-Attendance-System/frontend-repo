"use client";

import { usePathname } from "next/navigation";

type Crumb = {
  href: string;
  label: string;
};

const sectionCrumbs: { prefix: string; label: string }[] = [
  { prefix: "/admin/staff", label: "Staff Management" },
  { prefix: "/admin/attendance", label: "Attendance Management" },
  { prefix: "/admin/reports", label: "Reports" },
  { prefix: "/admin/settings", label: "Settings" },
  { prefix: "/admin/audit-log", label: "Audit Log" },
];

function crumbsFor(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ href: "/admin", label: "Admin Panel" }];
  const section = sectionCrumbs.find((item) => pathname.startsWith(item.prefix));

  if (!section) {
    return crumbs;
  }

  crumbs.push({ href: section.prefix, label: section.label });

  if (pathname.startsWith("/admin/settings/office-qr")) {
    crumbs.push({ href: pathname, label: "Office QR Management" });
  }

  if (section.prefix === "/admin/attendance" && pathname !== "/admin/attendance") {
    const correction = pathname.match(/^\/admin\/attendance\/([^/]+)\/correct$/);
    if (correction) {
      crumbs.push({
        href: `/admin/attendance/${correction[1]}`,
        label: "Attendance Details",
      });
      crumbs.push({ href: pathname, label: "Record Correction" });
    } else {
      crumbs.push({ href: pathname, label: "Attendance Details" });
    }
  }

  return crumbs;
}

export function useBreadcrumbs() {
  const pathname = usePathname();
  return crumbsFor(pathname);
}
