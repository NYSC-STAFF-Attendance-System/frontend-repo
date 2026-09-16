"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { api } from "@/lib/api";
import type { StaffProfile } from "@/types";

const StaffContext = createContext<StaffProfile | null>(null);

/**
 * The signed-in staff member, for any screen inside AuthGuard.
 *
 * Returns a StaffProfile, never null, because the guard does not render its
 * children until it has one. Screens therefore never write `staff?.fullName`.
 */
export function useStaff(): StaffProfile {
  const staff = useContext(StaffContext);
  if (!staff) {
    throw new Error("useStaff was called outside AuthGuard.");
  }
  return staff;
}

/**
 * Gate for every signed-in screen.
 *
 * Written once here rather than repeated in each page, so there is one place
 * where "who is allowed in" is decided and one place to change it.
 *
 * This is convenience, not security. Anyone can open a protected URL and read
 * the JavaScript; what actually protects the data is the backend refusing a
 * request without a valid session. The guard's job is to send people somewhere
 * sensible instead of showing them a broken screen.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffProfile | null>(null);

  useEffect(() => {
    let active = true;

    api.auth.getProfile().then((profile) => {
      if (!active) return;

      if (!profile) {
        // replace, not push: a signed-out user pressing Back should not land
        // on the protected page they were just bounced off.
        router.replace("/login");
        return;
      }

      if (profile.accountStatus === "banned") {
        router.replace("/blocked?reason=banned");
        return;
      }

      setStaff(profile);
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (!staff) {
    return (
      <Screen>
        <LoadingState label="Checking your account" />
      </Screen>
    );
  }

  return <StaffContext.Provider value={staff}>{children}</StaffContext.Provider>;
}
