"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { useAdminLogin } from "./use-admin-login";

/**
 * Sign-in form for the admin dashboard.
 *
 * Laid out as a centred card rather than the full-width phone layout the staff
 * screens use, because admins mostly work from a desktop. It still works on a
 * phone: the card is simply full width there.
 *
 * Says "Admin dashboard" under the seal so nobody confuses it with the staff
 * sign-in, which sits behind the same emblem.
 */
export function AdminLoginView() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    submitting,
    formError,
    fieldErrors,
    submit,
  } = useAdminLogin();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <header className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark size={56} />
          <div className="flex flex-col">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
              National Youth Service Corps
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Admin dashboard
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Sign in with your work email.</p>
        </header>

        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <Field
            label="Work email"
            name="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
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

        {/* For staff who land here by mistake. Without it they would try their
            staff ID, get "not correct", and assume their account is broken. */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Recording attendance?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Use the staff sign-in
          </Link>
        </p>
      </div>
    </main>
  );
}
