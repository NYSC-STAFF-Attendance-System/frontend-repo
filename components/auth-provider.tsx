"use client";

import { notFound, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { useStaff } from "@/hooks/use-staff";
import { adminLoginHref, currentPath, isAdminRole, loginHref } from "@/lib/auth/redirect";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { hydrateAuth } from "@/lib/store/slices/auth-slice";

export { useStaff };

/**
 * The session is in localStorage, so the server always renders the signed-out
 * loading state. A tab that already knows who is signed in must paint that
 * same state first. Showing the dashboard on the first client render makes
 * the sidebar disagree with the HTML.
 */
function useClientReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}

function GuardLoading({ variant }: { variant: "staff" | "admin" }) {
  if (variant === "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page">
        <LoadingState label="Checking your account" />
      </div>
    );
  }

  return (
    <Screen>
      <LoadingState label="Checking your account" />
    </Screen>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const ready = useClientReady();
  const status = useAppSelector((state) => state.auth.status);
  const profile = useAppSelector((state) => state.auth.profile);

  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!ready || status === "idle" || status === "loading") return;
    if (!profile) {
      router.replace(loginHref(currentPath(pathname, searchParams.toString() ? `?${searchParams}` : "")));
      return;
    }
    // A dashboard JWT is not a staff session. staffId is empty only for that
    // login; mock staff profiles always carry an id.
    if (isAdminRole(profile.role) && !profile.staffId) {
      router.replace("/admin");
      return;
    }
    if (profile.accountStatus === "banned") {
      router.replace("/blocked?reason=banned");
    }
  }, [pathname, profile, ready, router, searchParams, status]);

  if (!ready || status === "idle" || status === "loading" || !profile) {
    return <GuardLoading variant="staff" />;
  }

  if (isAdminRole(profile.role) && !profile.staffId) {
    return <GuardLoading variant="staff" />;
  }

  if (profile.accountStatus === "banned") {
    return <GuardLoading variant="staff" />;
  }

  return children;
}

/**
 * Gate for /admin.
 *
 * Signed-out visitors are sent to /admin/login - not the staff /login, which
 * checks the device and would refuse an admin on an office computer - with a
 * redirect back here. Signed-in staff who were never invited still get a 404.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const ready = useClientReady();
  const status = useAppSelector((state) => state.auth.status);
  const profile = useAppSelector((state) => state.auth.profile);

  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!ready || status === "idle" || status === "loading") return;
    if (!profile) {
      router.replace(adminLoginHref(currentPath(pathname, searchParams.toString() ? `?${searchParams}` : "")));
    }
  }, [pathname, profile, ready, router, searchParams, status]);

  if (!ready || status === "idle" || status === "loading") {
    return <GuardLoading variant="admin" />;
  }

  if (!profile) {
    return <GuardLoading variant="admin" />;
  }

  if (!isAdminRole(profile.role) || profile.accountStatus === "banned") {
    notFound();
  }

  return children;
}
