"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Why this person cannot continue. Anything unrecognised falls back to the
 * generic wording rather than showing an empty screen.
 */
type Reason = "banned" | "device";

function reasonFrom(value: string | null): Reason | null {
  return value === "banned" || value === "device" ? value : null;
}

/**
 * /blocked - the dead end for an account that cannot be used.
 *
 * Both cases are resolved by a person, not by the app: only an office admin can
 * lift a ban or reset a device binding. So there is no retry button here. The
 * useful thing this screen can do is say plainly what happened and who to ask.
 */
export function BlockedView() {
  const reason = reasonFrom(useSearchParams().get("reason"));

  const { title, message } = describe(reason);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <ShieldAlert aria-hidden="true" className="size-8 text-destructive" />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Your past attendance records are not affected.
      </p>

      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        variant="outline"
        size="lg"
        className="w-full"
      >
        Back to sign in
      </Button>
    </div>
  );
}

function describe(reason: Reason | null): { title: string; message: string } {
  switch (reason) {
    case "banned":
      return {
        title: "Account deactivated",
        message:
          "This account can no longer sign in or record attendance. Speak to your office admin if you think this is a mistake.",
      };
    case "device":
      return {
        title: "This is not your registered phone",
        message:
          "Attendance can only be recorded from the phone you registered with. If you changed phone, your office admin has to reset the binding for you.",
      };
    default:
      return {
        title: "You cannot continue",
        message:
          "This account is not able to use the app right now. Speak to your office admin.",
      };
  }
}
