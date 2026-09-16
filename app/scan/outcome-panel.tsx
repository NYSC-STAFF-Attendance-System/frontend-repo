"use client";

import { CheckCircle2, Clock, MapPinOff, ShieldAlert, WifiOff, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { timeFromIso } from "@/lib/format";
import { assertNever, cn } from "@/lib/utils";
import type { AttendanceDay, AttendanceOutcome } from "@/types";

type Tone = "success" | "warning" | "failure";

type Description = {
  tone: Tone;
  icon: React.ReactNode;
  title: string;
  message: string;
  /** The record to show sign in and sign out times from, when there is one. */
  day?: AttendanceDay;
  /** Only set where trying again could plausibly work. */
  retryLabel?: string;
  /** An admin has to fix this one; point at the page that explains who. */
  blockedReason?: "device" | "banned";
};

/**
 * Renders the backend's verdict after attendance was submitted.
 *
 * Every branch of AttendanceOutcome is handled here, and assertNever at the
 * bottom means adding an eleventh outcome breaks this build rather than
 * rendering an empty panel at an office door.
 */
export function OutcomePanel({
  outcome,
  onRetry,
}: {
  outcome: AttendanceOutcome;
  onRetry: () => void;
}) {
  const d = describe(outcome);

  return (
    <section
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border p-6 text-center",
        d.tone === "success" && "border-success/30 bg-success/5",
        d.tone === "warning" && "border-border bg-muted/40",
        d.tone === "failure" && "border-destructive/30 bg-destructive/5",
      )}
    >
      <span
        className={cn(
          d.tone === "success" && "text-success",
          d.tone === "warning" && "text-muted-foreground",
          d.tone === "failure" && "text-destructive",
        )}
      >
        {d.icon}
      </span>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">{d.title}</h2>
        <p className="text-sm text-muted-foreground">{d.message}</p>
      </div>

      {d.day?.signInAt ? (
        <dl className="flex gap-8 pt-1">
          <div>
            <dt className="text-xs text-muted-foreground">Sign in</dt>
            <dd className="text-base font-medium text-foreground tabular-nums">
              {timeFromIso(d.day.signInAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Sign out</dt>
            <dd className="text-base font-medium text-foreground tabular-nums">
              {d.day.signOutAt ? timeFromIso(d.day.signOutAt) : "—"}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="flex w-full flex-col gap-2 pt-2">
        {d.retryLabel ? (
          <Button size="xl" onClick={onRetry} className="w-full">
            {d.retryLabel}
          </Button>
        ) : null}

        {d.blockedReason ? (
          <Button
            render={<Link href={`/blocked?reason=${d.blockedReason}`} />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="w-full"
          >
            What does this mean?
          </Button>
        ) : null}

        <Button
          render={<Link href="/home" />}
          nativeButton={false}
          variant={d.retryLabel ? "ghost" : "outline"}
          size="lg"
          className="w-full"
        >
          Back to home
        </Button>
      </div>
    </section>
  );
}

function describe(outcome: AttendanceOutcome): Description {
  switch (outcome.kind) {
    case "signed_in":
      return {
        tone: "success",
        icon: <CheckCircle2 aria-hidden="true" className="size-8" />,
        title: "Signed in",
        message: `Recorded at ${outcome.day.officeName}. Scan again when you leave.`,
        day: outcome.day,
      };

    case "signed_out":
      return {
        tone: "success",
        icon: <CheckCircle2 aria-hidden="true" className="size-8" />,
        title: "Signed out",
        message: "That completes your day. Nothing else to do.",
        day: outcome.day,
      };

    case "already_complete":
      return {
        tone: "warning",
        icon: <CheckCircle2 aria-hidden="true" className="size-8" />,
        title: "Already done today",
        message: "You have signed in and out today. Further scans are not recorded.",
        day: outcome.day,
      };

    case "outside_geofence":
      return {
        tone: "failure",
        icon: <MapPinOff aria-hidden="true" className="size-8" />,
        title: "You are too far away",
        // Wording fixed by the spec.
        message: "Please go to your office to sign in. Nothing has been recorded.",
        retryLabel: "I am at the office now",
      };

    case "wrong_device":
      return {
        tone: "failure",
        icon: <ShieldAlert aria-hidden="true" className="size-8" />,
        title: "This is not your registered phone",
        message:
          "Attendance only records from the phone you registered with. Your office admin can reset this for you.",
        blockedReason: "device",
      };

    case "account_banned":
      return {
        tone: "failure",
        icon: <ShieldAlert aria-hidden="true" className="size-8" />,
        title: "Account deactivated",
        message: "This account cannot record attendance. Speak to your office admin.",
        blockedReason: "banned",
      };

    case "office_inactive":
      return {
        tone: "failure",
        icon: <XCircle aria-hidden="true" className="size-8" />,
        title: "This office is not active",
        message:
          "Attendance is not being recorded here. Check with your office admin which code to use.",
      };

    case "invalid_token":
      return {
        tone: "failure",
        icon: <XCircle aria-hidden="true" className="size-8" />,
        title: "This code is no longer valid",
        message:
          "The office code may have been reprinted. Ask your office admin for the current one.",
      };

    case "rate_limited":
      return {
        tone: "warning",
        icon: <Clock aria-hidden="true" className="size-8" />,
        title: "Too many attempts",
        message: outcome.retryAfterSeconds
          ? `Wait ${outcome.retryAfterSeconds} seconds and scan again.`
          : "Wait a moment and scan again.",
      };

    case "offline":
      return {
        tone: "failure",
        icon: <WifiOff aria-hidden="true" className="size-8" />,
        title: "You are offline",
        message:
          "Attendance could not be sent, so nothing was recorded. Reconnect and try again.",
        retryLabel: "Try again",
      };

    case "error":
      return {
        tone: "failure",
        icon: <XCircle aria-hidden="true" className="size-8" />,
        title: "Something went wrong",
        message: `${outcome.message} Nothing has been recorded.`,
        retryLabel: "Try again",
      };

    default:
      return assertNever(outcome);
  }
}
