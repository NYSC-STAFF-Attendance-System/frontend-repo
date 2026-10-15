"use client";

import { NO_RESPONSE_MESSAGE } from "@/lib/messages";
import { useState } from "react";
import { api } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import { assertNever } from "@/lib/utils";
import type { RegisterResult, StaffLookupResult } from "@/types";

type RegisterFailure = Exclude<RegisterResult, { kind: "success" }>;
type FormField = "email" | "phone" | "password" | "confirm";
export type RegisterFieldErrors = Partial<Record<FormField, string>>;

const FORM_FIELDS: readonly FormField[] = ["email", "phone", "password", "confirm"];

/**
 * Sorts the server's field errors into the ones this form can show under an
 * input, and the rest.
 *
 * The server can reject fields the person never sees here - staffId and
 * deviceId are filled in by the app. Those messages must still reach the
 * person, so they are returned separately to show above the button, rather
 * than being dropped.
 */
function splitFieldErrors(fieldErrors: Record<string, string>): {
  fields: RegisterFieldErrors;
  other: string[];
} {
  const fields: RegisterFieldErrors = {};
  const other: string[] = [];
  for (const [key, message] of Object.entries(fieldErrors)) {
    const field = FORM_FIELDS.find((name) => name === key);
    if (field) fields[field] = message;
    else other.push(message);
  }
  return { fields, other };
}

export function useStepDetails(
  staff: StaffLookupResult,
  onRegistered: (registered: { email: string; staffId: string }) => void,
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
      // The staff ID travels on so /verify-email can resend the link: the
      // backend resends by staff ID, not by email.
      onRegistered({ email: result.email, staffId: staff.staffId });
      return;
    }

    if (result.kind === "invalid_details") {
      const { fields, other } = splitFieldErrors(result.fieldErrors);
      setErrors(fields);
      setFormError(other.length > 0 ? other.join(" ") : null);
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
      return NO_RESPONSE_MESSAGE;
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}
