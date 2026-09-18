"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { assertNever } from "@/lib/utils";
import type { ResetPasswordResult } from "@/types";

type Errors = Partial<Record<"password" | "confirm", string>>;

export function useResetPasswordToken() {
  return useSearchParams().get("token");
}

export function useResetPasswordForm(token: string) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const next: Errors = {};
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Both passwords must match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await api.password.reset({ token, password });
    setSubmitting(false);

    if (result.kind === "success") {
      setDone(true);
      return;
    }
    if (result.kind === "weak_password") {
      setErrors({ password: result.message });
      return;
    }
    setFormError(messageFor(result));
  }

  return {
    password,
    setPassword,
    confirm,
    setConfirm,
    submitting,
    errors,
    formError,
    done,
    submit,
  };
}

function messageFor(
  result: Exclude<ResetPasswordResult, { kind: "success" } | { kind: "weak_password" }>,
): string {
  switch (result.kind) {
    case "invalid_token":
      return "That link is not valid. Request a new one from the sign in page.";
    case "expired_token":
      return "That link has expired. Request a new one from the sign in page.";
    case "offline":
      return "You appear to be offline. Check your connection and try again.";
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}
