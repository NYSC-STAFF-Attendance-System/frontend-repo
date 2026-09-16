"use client";

import { useState } from "react";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import { assertNever } from "@/lib/utils";
import type { RegisterResult, StaffLookupResult } from "@/types";

type RegisterFailure = Exclude<RegisterResult, { kind: "success" }>;

type Errors = Partial<Record<"email" | "phone" | "password" | "confirm", string>>;

/**
 * Final step: the details the staff member supplies themselves, plus the device
 * binding.
 *
 * Note what is not on this form. Name, office and department already exist on
 * the record and are not editable here - an admin owns those. Asking for them
 * again would let someone overwrite a record they had merely guessed the ID of.
 */
export function StepDetails({
  staff,
  onRegistered,
}: {
  staff: StaffLookupResult;
  onRegistered: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const next: Errors = {};
    // Deliberately loose: one @ with something either side. Anything stricter
    // rejects real addresses, and the verification email is the real check.
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
      // The server can reject a field the client was happy with. Merge rather
      // than replace so a message lands under the input it belongs to.
      setErrors(result.fieldErrors as Errors);
      return;
    }

    setFormError(messageFor(result));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field
        label="Email address"
        name="email"
        type="email"
        inputMode="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        hint="We send a verification link here before you can sign in."
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        disabled={submitting}
      />

      <Field
        label="Phone number"
        name="phone"
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={errors.phone}
        autoComplete="tel"
        disabled={submitting}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        hint="At least 8 characters."
        autoComplete="new-password"
        disabled={submitting}
      />

      <Field
        label="Confirm password"
        name="confirm"
        type="password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        error={errors.confirm}
        autoComplete="new-password"
        disabled={submitting}
      />

      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        This phone becomes your attendance device. You will only be able to sign
        in and record attendance from it. If you change phone, your office admin
        has to reset it for you.
      </p>

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="xl" disabled={submitting} className="mt-1 w-full">
        {submitting ? "Creating your account..." : "Create account"}
      </Button>
    </form>
  );
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
