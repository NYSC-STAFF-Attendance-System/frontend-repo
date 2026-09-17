"use client";

import Link from "next/link";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { useResetPasswordForm, useResetPasswordToken } from "./use-reset-password";

/**
 * Reads the token, then hands a guaranteed string to the form below.
 *
 * Splitting it this way is what avoids a cast: inside ResetPasswordForm the
 * token is plainly a string, because a component that receives one cannot be
 * rendered without it.
 */
export function ResetPasswordView() {
  const token = useResetPasswordToken();

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground">That link is not valid</h1>
          <p className="text-sm text-muted-foreground">
            Open the link directly from your email, or request a new one.
          </p>
        </div>
        <Button render={<Link href="/forgot-password" />} nativeButton={false} size="xl" className="w-full">
          Request a new link
        </Button>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

function ResetPasswordForm({ token }: { token: string }) {
  const {
    password,
    setPassword,
    confirm,
    setConfirm,
    submitting,
    errors,
    formError,
    done,
    submit,
  } = useResetPasswordForm(token);

  if (done) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Password updated</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your new password on your registered phone.
          </p>
        </div>
        <Button render={<Link href="/login" />} nativeButton={false} size="xl" className="w-full">
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose something you have not used on this account before.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field
          label="New password"
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
    </>
  );
}
