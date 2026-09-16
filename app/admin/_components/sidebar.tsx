"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NyscLogo } from "./logo";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: ClipboardList },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={cn(
          "fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-[2px] lg:hidden",
          open ? "block" : "hidden",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[240px] shrink-0 flex-col bg-white px-4 py-5 transition-transform lg:static lg:h-full lg:translate-x-0 border-r border-[#BDCABE]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <NyscLogo />
          <button
            type="button"
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-nysc-muted text-nysc"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800",
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.9} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button className="mt-auto h-11 w-full rounded-full bg-nysc-dark text-[15px] text-white hover:bg-nysc-dark/90">
          <Clock data-icon="inline-start" className="size-4" />
          Clock In/Out
        </Button>
      </aside>
    </>
  );
}
