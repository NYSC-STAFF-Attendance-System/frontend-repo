"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStaff } from "@/hooks/use-staff";
import { useAppDispatch } from "@/lib/store/hooks";
import { signOut } from "@/lib/store/slices/auth-slice";

export type HeaderNotice = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "info" | "warn" | "ok";
  href: string;
};

const notices: HeaderNotice[] = [
  {
    id: "n1",
    title: "Pending staff approval",
    detail: "Chinelo Okoro submitted a Face ID request.",
    time: "9:41 AM",
    tone: "warn",
    href: "/admin/staff",
  },
  {
    id: "n2",
    title: "Late arrival flagged",
    detail: "Chidi Nwachukwu scanned 17 minutes after cutoff.",
    time: "8:32 AM",
    tone: "warn",
    href: "/admin/attendance",
  },
  {
    id: "n3",
    title: "Device reset completed",
    detail: "Emmanuel Danjuma’s trusted device was unbound.",
    time: "Yesterday",
    tone: "info",
    href: "/admin/audit-log",
  },
  {
    id: "n4",
    title: "Attendance recorded",
    detail: "Oluwaseun Adebayo signed in at HQ Main Gate.",
    time: "Yesterday",
    tone: "ok",
    href: "/admin/attendance",
  },
];

export function useAdminHeader() {
  const staff = useStaff();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [unreadIds, setUnreadIds] = useState(() => new Set(notices.slice(0, 2).map((item) => item.id)));
  const [signingOut, setSigningOut] = useState(false);

  const unreadCount = unreadIds.size;

  function markAllRead() {
    setUnreadIds(new Set());
  }

  function markRead(id: string) {
    setUnreadIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  function go(href: string) {
    router.push(href);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await dispatch(signOut());
    router.replace("/login");
  }

  return {
    staff,
    notices,
    unreadCount,
    isUnread: (id: string) => unreadIds.has(id),
    markRead,
    markAllRead,
    go,
    signingOut,
    handleSignOut,
  };
}

export function roleLabel(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Office Admin";
  return "Staff";
}

export function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
