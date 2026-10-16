"use client";

import { NO_RESPONSE_MESSAGE } from "@/lib/messages";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { assertNever } from "@/lib/utils";
import type { PasswordResetRequestResult, VerifyEmailResult } from "@/types";

export type VerifyEmailState =
  | { name: "awaiting_link" }
  | { name: "verifying" }
  | { name: "result"; result: VerifyEmailResult };

/**
 * Reads the three things this page can arrive with:
 *
 *   ?email=   where the link was sent, shown in the "check your email" copy
 *   ?staff=   the staff ID, needed to resend - the backend resends by ID
 *   ?token=   from the link in the email, verified straight away
 *
 * Registration adds email and staff. The email link carries only the token.
 */
export function useVerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const staffId = searchParams.get("staff");

  const [state, setState] = useState<VerifyEmailState>(
    token ? { name: "verifying" } : { name: "awaiting_link" },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    api.registration.verifyEmail(token).then((result) => {
      if (!active) return;
      setState({ name: "result", result });
    });

    return () => {
      active = false;
    };
  }, [token]);

  return { email, staffId, state };
}

function messageFor(result: Exclude<PasswordResetRequestResult, { kind: "sent" }>): string {
  switch (result.kind) {
    case "rate_limited":
      return result.retryAfterSeconds
        ? `Too many requests. Try again in ${result.retryAfterSeconds} seconds.`
        : "Too many requests. Try again shortly.";
    case "offline":
      return NO_RESPONSE_MESSAGE;
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}

/**
 * Sends a new verification link.
 *
 * When the staff ID is already known it is used as-is. When it is not - someone
 * who opened an expired link straight from their email - the person is asked
 * for it, because without it there is nothing to resend to and they would be
 * stuck on an error with no way forward.
 */
export function useResendVerification(knownStaffId: string | null) {
  const [staffId, setStaffId] = useState(knownStaffId ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = staffId.trim();
    if (!id) {
      setError("Enter your staff ID.");
      return;
    }

    setError(null);
    setSending(true);
    const result = await api.registration.resendVerification(id);
    setSending(false);

    if (result.kind === "sent") {
      setSent(true);
      return;
    }
    setError(messageFor(result));
  }

  return {
    staffId,
    setStaffId,
    needsStaffId: !knownStaffId,
    sending,
    sent,
    error,
    resend,
  };
}
