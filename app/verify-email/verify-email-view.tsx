"use client";

import { NO_RESPONSE_TITLE } from "@/lib/messages";
import Link from "next/link";
import { Field } from "@/components/field";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { assertNever } from "@/lib/utils";
import type { VerifyEmailResult } from "@/types";
import { useResendVerification, useVerifyEmail } from "./use-verify-email";

/**
 * Serves two arrivals with one implementation:
 *
 *   /verify-email?email=…&staff=…   just registered, telling them to check the inbox
 *   /verify-email?token=…           followed the link in that email
 *
 * Keeping both here means the wording about what to do next exists once.
 */
export function VerifyEmailView() {
  const { email, staffId, state } = useVerifyEmail();

  if (state.name === "verifying") {
    return <LoadingState label="Confirming your email" />;
  }

  if (state.name === "awaiting_link") {
    return <AwaitingLink email={email} staffId={staffId} />;
  }

  return <Outcome result={state.result} staffId={staffId} />;
}

function AwaitingLink({ email, staffId }: { email: string | null; staffId: string | null }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{email}</span>. Open it
              on this phone, then sign in.
            </>
          ) : (
            "Open the verification link we sent you, on this phone, then sign in."
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button render={<Link href="/login" />} nativeButton={false} size="xl" className="w-full">
          Go to sign in
        </Button>
        <ResendLink knownStaffId={staffId} variant="ghost" />
      </div>

      <p className="text-sm text-muted-foreground">
        Nothing arrived? Check your spam folder, or ask your office admin to
        confirm the address on your record.
      </p>
    </div>
  );
}

function Outcome({ result, staffId }: { result: VerifyEmailResult; staffId: string | null }) {
  const { title, message, canResend } = describe(result);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button render={<Link href="/login" />} nativeButton={false} size="xl" className="w-full">
          Go to sign in
        </Button>

        {/* Only where a fresh link would help. A verified account and an
            offline phone both stay silent here. */}
        {canResend ? <ResendLink knownStaffId={staffId} variant="outline" /> : null}
      </div>
    </div>
  );
}

/**
 * The "send a new link" control.
 *
 * Just a button when the staff ID is known. A staff ID field and a button when
 * it is not, which is the case for anyone arriving from an emailed link.
 */
function ResendLink({
  knownStaffId,
  variant,
}: {
  knownStaffId: string | null;
  variant: "ghost" | "outline";
}) {
  const { staffId, setStaffId, needsStaffId, sending, sent, error, resend } =
    useResendVerification(knownStaffId);

  if (sent) {
    return (
      <p role="status" className="text-center text-sm text-muted-foreground">
        A new link is on its way. Check your email.
      </p>
    );
  }

  return (
    <form onSubmit={resend} noValidate className="flex flex-col gap-3">
      {needsStaffId ? (
        <Field
          label="Staff ID"
          name="staffId"
          value={staffId}
          onChange={(event) => setStaffId(event.target.value)}
          error={error}
          hint="Enter your staff ID and we will send a new link."
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect="off"
          disabled={sending}
        />
      ) : error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" variant={variant} size="lg" disabled={sending} className="w-full">
        {sending ? "Sending..." : "Send a new link"}
      </Button>
    </form>
  );
}

function describe(result: VerifyEmailResult): {
  title: string;
  message: string;
  canResend: boolean;
} {
  switch (result.kind) {
    case "verified":
      return {
        title: "Email confirmed",
        message: "Your account is ready. Sign in on this phone to continue.",
        canResend: false,
      };
    case "already_verified":
      return {
        title: "Already confirmed",
        message: "This email was confirmed earlier. You can sign in.",
        canResend: false,
      };
    case "expired_token":
      return {
        title: "That link has expired",
        message: "Verification links do not last forever. Request a new one.",
        canResend: true,
      };
    case "invalid_token":
      return {
        title: "That link is not valid",
        message:
          "It may have been copied incompletely. Open the link directly from your email, or request a new one.",
        canResend: true,
      };
    case "offline":
      return {
        title: NO_RESPONSE_TITLE,
        message: "Check your connection and open the link again.",
        canResend: false,
      };
    case "error":
      return { title: "Something went wrong", message: result.message, canResend: true };
    default:
      return assertNever(result);
  }
}
