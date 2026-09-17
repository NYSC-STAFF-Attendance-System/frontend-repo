"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { assertNever } from "@/lib/utils";
import type { ChangePasswordResult } from "@/types";

type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

export function useChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found: Errors = {};
    if (!current) found.current = "Enter your current password.";
    if (next.length < 8) found.next = "Use at least 8 characters.";
    if (next && next === current) found.next = "Choose a password you have not used here before.";
    if (confirm !== next) found.confirm = "Both passwords must match.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const result = await api.password.change({
      currentPassword: current,
      newPassword: next,
    });
    setSubmitting(false);

    if (result.kind === "success") {
      setDone(true);
      return;
    }
    if (result.kind === "wrong_current_password") {
      setErrors({ current: "That is not your current password." });
      return;
    }
    if (result.kind === "weak_password") {
      setErrors({ next: result.message });
      return;
    }
    setFormError(messageFor(result));
  }

  return {
    current,
    setCurrent,
    next,
    setNext,
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
  result: Exclude<
    ChangePasswordResult,
    { kind: "success" } | { kind: "wrong_current_password" } | { kind: "weak_password" }
  >,
): string {
  switch (result.kind) {
    case "offline":
      return "You appear to be offline. Check your connection and try again.";
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}
