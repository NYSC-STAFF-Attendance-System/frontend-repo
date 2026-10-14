"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChangePassword } from "./use-change-password";
import { Field } from "@/components/field";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";

/** /profile/password - change password while signed in. */
export default function ChangePasswordPage() {
  const router = useRouter();
  const {
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
  } = useChangePassword();

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

      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
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
