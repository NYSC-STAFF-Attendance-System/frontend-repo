"use client";

import Link from "next/link";
import { useForgotPassword } from "./use-forgot-password";
import { Field } from "@/components/field";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";

/**
 * /forgot-password
 *
 * No search params here, so no Suspense split is needed - that is only required
 * where useSearchParams is called.
 */
export default function ForgotPasswordPage() {
  const { email, setEmail, submitting, fieldError, formError, sent, submit } =
    useForgotPassword();

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
        <Button render={<Link href="/login" />} nativeButton={false} size="xl" className="mt-8 w-full">
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

      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
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
