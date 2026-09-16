"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/field";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { assertNever } from "@/lib/utils";
import type { ChangePasswordResult } from "@/types";

type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

/** /profile/password - change password while signed in. */
export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const found: Errors = {};
    if (!current) found.current = "Enter your current password.";
    if (next.length < 8) found.next = "Use at least 8 characters.";
    // Caught here rather than by the server: reusing the same password is not a
    // failure the backend needs to hear about.
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

  if (done) {
    return (
      <Screen className="gap-6">
        <h1 className="text-2xl font-semibold text-foreground">Password changed</h1>
        <p className="text-sm text-muted-foreground">
          Use your new password next time you sign in. Your registered phone has
          not changed.
        </p>
        <Button size="xl" className="w-full" onClick={() => router.replace("/profile")}>
          Back to profile
        </Button>
      </Screen>
    );
  }

  return (
    <Screen className="gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Change password</h1>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Field
          label="Current password"
          name="current"
          type="password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          error={errors.current}
          autoComplete="current-password"
          disabled={submitting}
        />

        <Field
          label="New password"
          name="next"
          type="password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          error={errors.next}
          hint="At least 8 characters."
          autoComplete="new-password"
          disabled={submitting}
        />

        <Field
          label="Confirm new password"
          name="confirm"
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
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
          {submitting ? "Saving..." : "Save new password"}
        </Button>
      </form>

      <Link
        href="/profile"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Cancel
      </Link>
    </Screen>
  );
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
