"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import { assertNever } from "@/lib/utils";
import type { RegisterResult, StaffLookupResult } from "@/types";

type RegisterFailure = Exclude<RegisterResult, { kind: "success" }>;
export type RegisterFieldErrors = Partial<
  Record<"email" | "phone" | "password" | "confirm", string>
>;

export function useStepDetails(
  staff: StaffLookupResult,
  onRegistered: (email: string) => void,
) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const next: RegisterFieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!phone.trim()) next.phone = "Enter your phone number.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Both passwords must match.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const deviceId = getDeviceId();
    if (!deviceId) {
      setFormError(
        "This browser is blocking site data, so we cannot register this phone as your device. Turn off private browsing and try again.",
      );
      return;
    }

    setSubmitting(true);
    const result = await api.registration.register({
      staffId: staff.staffId,
      email: email.trim(),
      phone: phone.trim(),
      password,
      deviceId,
    });
    setSubmitting(false);

    if (result.kind === "success") {
      onRegistered(result.email);
      return;
    }

    if (result.kind === "invalid_details") {
      setErrors(result.fieldErrors as RegisterFieldErrors);
      return;
    }

    setFormError(messageFor(result));
  }

  return {
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirm,
    setConfirm,
    submitting,
    errors,
    formError,
    submit,
  };
}

function messageFor(result: Exclude<RegisterFailure, { kind: "invalid_details" }>): string {
  switch (result.kind) {
    case "already_registered":
      return "This staff ID was registered while you were filling this in. Try signing in instead.";
    case "offline":
      return "You appear to be offline. Check your connection and try again.";
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}
