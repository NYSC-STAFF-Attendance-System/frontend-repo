"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/states";
import { assertNever } from "@/lib/utils";
import type { VerifyAdminInviteResult } from "@/types";
import { useVerifyAdminInvite } from "./use-verify-admin-invite";

export function InviteAdminView() {
  const state = useVerifyAdminInvite();

  if (state.name === "verifying") {
    return <LoadingState label="Confirming your invitation" />;
  }

  if (state.name === "missing") {
    return (
      <OutcomeCopy
        title="That link is not valid"
        message="Open the invitation from your email. This page needs the token from that link."
      />
    );
  }

  return <Outcome result={state.result} />;
}

function Outcome({ result }: { result: VerifyAdminInviteResult }) {
  switch (result.kind) {
    case "verified":
      return (
        <OutcomeCopy
          title="You are now an admin"
          message={`Sign in with ${result.email} to open the admin dashboard. Use your staff ID if you only need the attendance app.`}
        />
      );
    case "already_verified":
      return (
        <OutcomeCopy
          title="Already confirmed"
          message="This invitation was used earlier. Sign in with your work email to open the admin dashboard."
        />
      );
    case "expired_token":
      return (
        <OutcomeCopy
          title="That link has expired"
          message="Ask a super admin to send a new invitation."
        />
      );
    case "invalid_token":
      return (
        <OutcomeCopy
          title="That link is not valid"
          message="It may have been copied incompletely. Open the link directly from your email."
        />
      );
    case "offline":
      return (
        <OutcomeCopy
          title="You appear to be offline"
          message="Check your connection and open the link again."
        />
      );
    case "error":
      return <OutcomeCopy title="Something went wrong" message={result.message} />;
    default:
      return assertNever(result);
  }
}

function OutcomeCopy({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button render={<Link href="/login" />} size="xl" className="w-full">
        Go to sign in
      </Button>
    </div>
  );
}
