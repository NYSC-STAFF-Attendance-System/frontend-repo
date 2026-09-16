"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/states";
import { api } from "@/lib/api";
import { assertNever } from "@/lib/utils";
import type { VerifyEmailResult } from "@/types";

type State =
  /** Arrived from /register. No token yet - the link is in their inbox. */
  | { name: "awaiting_link" }
  | { name: "verifying" }
  | { name: "result"; result: VerifyEmailResult };

/**
 * Serves two arrivals with one implementation:
 *
 *   /verify-email?email=...   just registered, telling them to check the inbox
 *   /verify-email?token=...   followed the link in that email
 *
 * Keeping both here means the wording about what to do next exists once.
 */
export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [state, setState] = useState<State>(
    token ? { name: "verifying" } : { name: "awaiting_link" },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    api.registration.verifyEmail(token).then((result) => {
      if (!active) return;
      setState({ name: "result", result });
    });

    return () => {
      active = false;
    };
  }, [token]);

  if (state.name === "verifying") {
    return <LoadingState label="Confirming your email" />;
  }

  if (state.name === "awaiting_link") {
    return <AwaitingLink email={email} />;
  }

  return <Outcome result={state.result} email={email} />;
}

function AwaitingLink({ email }: { email: string | null }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    await api.registration.resendVerification(email);
    setResending(false);
    setResent(true);
  }

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

        {email ? (
          <Button
            variant="ghost"
            size="lg"
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full"
          >
            {resent ? "Link sent again" : resending ? "Sending..." : "Resend the link"}
          </Button>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">
        Nothing arrived? Check your spam folder, or ask your office admin to
        confirm the address on your record.
      </p>
    </div>
  );
}

function Outcome({ result, email }: { result: VerifyEmailResult; email: string | null }) {
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

        {/* Only offered where a fresh link would actually help. An invalid
            token and a verified account both stay silent here. */}
        {canResend && email ? (
          <Button
            variant="outline"
            size="lg"
            onClick={() => api.registration.resendVerification(email)}
            className="w-full"
          >
            Send a new link
          </Button>
        ) : null}
      </div>
    </div>
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
          "It may have been copied incompletely. Open the link directly from your email.",
        canResend: true,
      };
    case "offline":
      return {
        title: "You appear to be offline",
        message: "Check your connection and open the link again.",
        canResend: false,
      };
    case "error":
      return { title: "Something went wrong", message: result.message, canResend: true };
    default:
      return assertNever(result);
  }
}
