"use client";

import { notFound, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { useStaff } from "@/hooks/use-staff";
import { currentPath, isAdminRole, loginHref } from "@/lib/auth/redirect";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { hydrateAuth } from "@/lib/store/slices/auth-slice";

export { useStaff };

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
  const status = useAppSelector((state) => state.auth.status);
  const profile = useAppSelector((state) => state.auth.profile);

  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (status === "idle" || status === "loading") return;
    if (!profile) {
      router.replace(loginHref(currentPath(pathname, searchParams.toString() ? `?${searchParams}` : "")));
      return;
    }
    if (profile.accountStatus === "banned") {
      router.replace("/blocked?reason=banned");
    }
  }, [pathname, profile, router, searchParams, status]);

  if (status === "idle" || status === "loading" || !profile) {
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
 * Signed-out visitors are sent to login with a redirect back here.
 * Signed-in staff who were never invited still get a 404.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const profile = useAppSelector((state) => state.auth.profile);

  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    if (status === "idle" || status === "loading") return;
    if (!profile) {
      router.replace(loginHref(currentPath(pathname, searchParams.toString() ? `?${searchParams}` : "")));
    }
  }, [pathname, profile, router, searchParams, status]);

  if (status === "idle" || status === "loading") {
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
