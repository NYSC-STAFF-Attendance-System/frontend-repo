"use client";

import { useAppSelector } from "@/lib/store/hooks";
import type { StaffProfile } from "@/types";

/**
 * The signed-in staff member, for any screen inside AuthGuard or AdminGuard.
 *
 * Returns a StaffProfile, never null, because the guard does not render its
 * children until it has one. Screens therefore never write `staff?.fullName`.
 */
export function useStaff(): StaffProfile {
  const profile = useAppSelector((state) => state.auth.profile);
  if (!profile) {
    throw new Error("useStaff was called outside AuthGuard or AdminGuard.");
  }
  return profile;
}
