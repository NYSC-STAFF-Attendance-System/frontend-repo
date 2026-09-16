"use client";

import Link from "next/link";
import { useState } from "react";
import { Field } from "@/components/field";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { assertNever } from "@/lib/utils";
import type { PasswordResetRequestResult } from "@/types";

/**
 * /forgot-password
 *
 * No search params here, so no Suspense split is needed - that is only required
 * where useSearchParams is called.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

  if (sent) {
    return (
      <Screen>
        <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
        {/* Worded so it is true whether or not the address exists. Confirming
            which addresses are registered would turn this form into a way to
            find out who works here. */}
        <p className="mt-2 text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{email.trim()}</span> is
          registered, we have sent a link for setting a new password. It expires
          after a short time.
        </p>
        <Button render={<Link href="/login" />} size="xl" className="mt-8 w-full">
          Back to sign in
        </Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the email on your staff record and we will send you a link.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Field
          label="Email address"
          name="email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          disabled={submitting}
        />

        {formError ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="xl" disabled={submitting} className="mt-1 w-full">
          {submitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </Screen>
  );
}

function messageFor(result: Exclude<PasswordResetRequestResult, { kind: "sent" }>): string {
  switch (result.kind) {
    case "rate_limited":
      return result.retryAfterSeconds
        ? `Too many requests. Try again in ${result.retryAfterSeconds} seconds.`
        : "Too many requests. Try again shortly.";
    case "offline":
      return "You appear to be offline. Check your connection and try again.";
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}
