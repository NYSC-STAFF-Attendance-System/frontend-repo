"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { destinationAfterLogin } from "@/lib/auth/redirect";
import { getDeviceId } from "@/lib/device";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/lib/store/hooks";
import { signedIn } from "@/lib/store/slices/auth-slice";
import { assertNever } from "@/lib/utils";
import type { LoginResult } from "@/types";

type LoginFailure = Exclude<LoginResult, { kind: "success" }>;
type FieldErrors = { id?: string; password?: string };

export function messageForLogin(result: LoginFailure): string {
  switch (result.kind) {
    case "invalid_credentials":
      return "That staff ID or password is not correct.";
    case "wrong_device":
      return "This account is registered to a different phone. Ask your office admin to reset your device before signing in here.";
    case "account_banned":
      return "This account has been deactivated. Contact your office admin.";
    case "email_not_verified":
      return `Check ${result.email} for a verification link, then sign in.`;
    case "rate_limited":
      return result.retryAfterSeconds
        ? `Too many attempts. Try again in ${result.retryAfterSeconds} seconds.`
        : "Too many attempts. Try again shortly.";
    case "offline":
      return "You appear to be offline. Check your connection and try again.";
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [staffIdOrEmail, setStaffIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: FieldErrors = {};
    if (!staffIdOrEmail.trim()) nextFieldErrors.id = "Enter your staff ID or email.";
    if (!password) nextFieldErrors.password = "Enter your password.";
    setFieldErrors(nextFieldErrors);
    setFormError(null);
    if (Object.keys(nextFieldErrors).length > 0) return;

    const deviceId = getDeviceId();
    if (!deviceId) {
      setFormError(
        "This browser is blocking site data, so we cannot identify your device. Turn off private browsing and try again.",
      );
      return;
    }

    setSubmitting(true);
    const result = await api.auth.login({
      staffIdOrEmail: staffIdOrEmail.trim(),
      password,
      deviceId,
    });

    if (result.kind === "success") {
      dispatch(signedIn(result.staff));
      router.replace(
        destinationAfterLogin({
          role: result.staff.role,
          usedEmail: staffIdOrEmail.includes("@"),
          redirect: searchParams.get("redirect"),
        }),
      );
      return;
    }

    setSubmitting(false);
    setFormError(messageForLogin(result));
  }

  return {
    staffIdOrEmail,
    setStaffIdOrEmail,
    password,
    setPassword,
    submitting,
    formError,
    fieldErrors,
    submit,
  };
}
