"use client";

import { NO_RESPONSE_MESSAGE } from "@/lib/messages";
import { useState } from "react";
import { api } from "@/lib/api";
import { assertNever } from "@/lib/utils";
import type { PasswordResetRequestResult } from "@/types";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError("Enter a valid email address.");
      return;
    }
    setFieldError(null);
    setSubmitting(true);
    const result = await api.password.requestReset(email.trim());
    setSubmitting(false);
    if (result.kind === "sent") {
      setSent(true);
      return;
    }
    setFormError(messageFor(result));
  }

  return { email, setEmail, submitting, fieldError, formError, sent, submit };
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
