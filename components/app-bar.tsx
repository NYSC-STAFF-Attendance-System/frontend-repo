"use client";

import { useStaff } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand";

/**
 * Initials from a full name, for the avatar.
 *
 * Takes the first and last word so "Chinedu Obinna Ibrahim" gives CI rather
 * than CO. A single-word name gives one letter instead of crashing on the
 * missing second.
 */
function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Top bar for the signed-in screens.
 *
 * Sticky rather than fixed so it scrolls with the document on iOS instead of
 * fighting the address bar as it collapses. It adds the top safe-area inset so
 * it clears the notch.
 *
 * Kept to 52px: with the bottom navigation also taking 56, anything taller
 * starts pushing the main action on /home below the fold on a small phone.
 */
export function AppBar() {
  const staff = useStaff();

  return (
    <header
      className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-[52px] w-full max-w-[28rem] items-center gap-2.5 px-4">
        <BrandMark size={28} />

        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-primary">
            NYSC
          </span>
          <span className="truncate text-sm font-semibold text-foreground">
            Staff Attendance
          </span>
        </div>

        <span
          // aria-hidden: the name is already on /profile and in the greeting on
          // /home, so announcing two letters here adds noise, not information.
          aria-hidden="true"
          className="ml-auto grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
        >
          {initialsOf(staff.fullName)}
        </span>
      </div>
    </header>
  );
}
