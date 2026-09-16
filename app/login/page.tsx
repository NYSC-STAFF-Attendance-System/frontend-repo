"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "@/components/brand";
import { Field } from "@/components/field";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import { assertNever } from "@/lib/utils";
import type { LoginResult } from "@/types";

/** Every login result except success, which is handled by navigating away. */
type LoginFailure = Exclude<LoginResult, { kind: "success" }>;

/**
 * Turns a failed login into something a staff member can act on.
 *
 * Kept out of the component so the switch is easy to read and so adding a new
 * LoginResult branch fails the build here rather than silently rendering
 * nothing. assertNever is what enforces that.
 *
 * Wrong device and deactivated account are shown inline rather than redirected
 * to /blocked: the person never got a session, they are still standing at the
 * login form, and what they need is the sentence telling them to talk to their
 * office admin.
 */
function messageFor(result: LoginFailure): string {
  switch (result.kind) {
    case "invalid_credentials":
      return "That staff ID or password is not correct.";
    case "wrong_device":
      return "This account is registered to a different phone. Ask your office admin to reset your device before signing in here.";
    case "account_banned":
      return "This account has been deactivated. Contact your office admin.";
    case "email_not_verified":
      return `Check ${result.email} for a verification link, then sign in.`;
    case "rate_limited":
      return result.retryAfterSeconds
        ? `Too many attempts. Try again in ${result.retryAfterSeconds} seconds.`
        : "Too many attempts. Try again shortly.";
    case "offline":
      return "You appear to be offline. Check your connection and try again.";
    case "error":
      return result.message;
    default:
      return assertNever(result);
  }
}

/**
 * /login - staff sign in.
 *
 * No GPS here. Location is requested only at attendance time, on /scan. The
 * device id is read from localStorage and sent with the credentials so the
 * backend can refuse a phone that is not the bound one.
 */
export default function LoginPage() {
  const router = useRouter();

  const [staffIdOrEmail, setStaffIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ id?: string; password?: string }>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Check the obvious locally so an empty form never costs a round trip.
    const nextFieldErrors: typeof fieldErrors = {};
    if (!staffIdOrEmail.trim()) nextFieldErrors.id = "Enter your staff ID or email.";
    if (!password) nextFieldErrors.password = "Enter your password.";
    setFieldErrors(nextFieldErrors);
    setFormError(null);
    if (Object.keys(nextFieldErrors).length > 0) return;

    const deviceId = getDeviceId();
    if (!deviceId) {
      setFormError(
        "This browser is blocking site data, so we cannot identify your device. Turn off private browsing and try again.",
      );
      return;
    }

    setSubmitting(true);
    const result = await api.auth.login({
      staffIdOrEmail: staffIdOrEmail.trim(),
      password,
      deviceId,
    });

    if (result.kind === "success") {
      // replace, not push: pressing Back from /home should not return to a
      // login form the person has already completed.
      //
      // The button is left disabled on purpose. Navigation is in flight, and
      // re-enabling it here would let a second tap fire a second login.
      router.replace("/home");
      return;
    }

    setSubmitting(false);
    setFormError(messageFor(result));
  }

  return (
    <Screen>
      <header className="mb-8 flex flex-col items-center gap-5 pt-4 text-center">
        <BrandLockup />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the phone you registered with.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
          // role="alert" so this is announced when it appears after a failed
          // submit, rather than added to the page silently.
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
    </Screen>
  );
}
