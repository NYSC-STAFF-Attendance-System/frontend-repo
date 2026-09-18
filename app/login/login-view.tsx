"use client";

import Link from "next/link";
import { BrandLockup } from "@/components/brand";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/use-login";

export function LoginView() {
  const {
    staffIdOrEmail,
    setStaffIdOrEmail,
    password,
    setPassword,
    submitting,
    formError,
    fieldErrors,
    submit,
  } = useLogin();

  return (
    <>
      <header className="mb-8 flex flex-col items-center gap-5 pt-4 text-center">
        <BrandLockup />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the phone you registered with.
          </p>
        </div>
      </header>

      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field
          label="Staff ID or email"
          name="staffIdOrEmail"
          value={staffIdOrEmail}
          onChange={(event) => setStaffIdOrEmail(event.target.value)}
          error={fieldErrors.id}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          disabled={submitting}
        />

        <Field
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          autoComplete="current-password"
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
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-3 text-sm">
        <Link href="/forgot-password" className="text-primary underline-offset-4 hover:underline">
          Forgot your password?
        </Link>
        <p className="text-muted-foreground">
          First time here?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Register your staff ID
          </Link>
        </p>
      </div>
    </>
  );
}
