"use client";

import { CalendarDays, House, QrCode, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Home", icon: House },
  { href: "/scan", label: "Scan", icon: QrCode },
  { href: "/history", label: "History", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: User },
] as const;

/**
 * Bottom navigation for signed-in screens.
 *
 * Fixed to the bottom because that is where a thumb rests on a phone held one
 * handed. Each tab is a 56px-tall target, comfortably above the 44px floor,
 * and the bar adds the safe-area inset so it clears the home indicator on
 * iPhones rather than sitting under it.
 *
 * Four tabs is the practical maximum at 375px before labels start truncating.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex w-full max-w-[28rem]">
        {TABS.map((tab) => {
          // startsWith so /profile/password keeps the Profile tab lit.
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                // aria-current is how a screen reader announces the active tab.
                // The colour change alone says nothing to someone not looking.
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
