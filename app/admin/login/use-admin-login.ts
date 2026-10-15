"use client";

import { NO_RESPONSE_MESSAGE } from "@/lib/messages";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { adminDestination } from "@/lib/auth/redirect";
import { useAppDispatch } from "@/lib/store/hooks";
import { signedIn } from "@/lib/store/slices/auth-slice";
import { assertNever } from "@/lib/utils";
import type { LoginResult } from "@/types";

type LoginFailure = Exclude<LoginResult, { kind: "success" }>;
type FieldErrors = { email?: string; password?: string };

/**
 * Dashboard wording for a failed sign-in.
 *
 * Kept separate from the staff messages because the advice differs: an admin
 * account has no registered phone, and it is Headquarters that deactivates or
 * invites admins, not an office admin.
 */
function messageFor(result: LoginFailure): string {
  switch (result.kind) {
    case "invalid_credentials":
      return "That email or password is not correct.";
    case "account_banned":
      return "This admin account has been deactivated. Contact Headquarters.";
    case "email_not_verified":
      return "Accept the invitation in your email before signing in.";
    case "wrong_device":
      // The admin login does not check devices, so this should never arrive.
      // Handled anyway so a backend change cannot leave the form blank.
      return "This account cannot sign in here. Contact Headquarters.";
    case "rate_limited":
      return result.retryAfterSeconds
        ? `Too many attempts. Try again in ${result.retryAfterSeconds} seconds.`
        : "Too many attempts. Try again shortly.";
    case "offline":
      return NO_RESPONSE_MESSAGE;
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}

/**
 * Form state and submission for /admin/login.
 *
 * No device ID is read or sent. That is the whole reason this page exists apart
 * from /login: the staff sign-in checks the device, and an admin working from an
 * office computer would be refused as being on the wrong phone.
 */
export function useAdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: FieldErrors = {};
    // Loose on purpose: one @ with something either side. The server is the
    // real check, and a stricter pattern rejects real addresses.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter your work email address.";
    }
    if (!password) next.password = "Enter your password.";
    setFieldErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await api.admin.login({ email: email.trim(), password });

    if (result.kind === "success") {
      dispatch(signedIn(result.staff));
      // Left disabled while navigation is in flight, so a second click cannot
      // fire a second sign-in.
      router.replace(adminDestination(searchParams.get("redirect")));
      return;
    }

    setSubmitting(false);
    setFormError(messageFor(result));
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    submitting,
    formError,
    fieldErrors,
    submit,
  };
}
