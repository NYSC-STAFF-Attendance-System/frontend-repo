"use client";

import { MapPin, QrCode } from "lucide-react";
import Link from "next/link";
import { useScan } from "./use-scan";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { assertNever } from "@/lib/utils";
import type {
  AttendanceOutcome,
  LocationFailure,
  Office,
  ScanResolution,
  TodayProgress,
} from "@/types";
import { OutcomePanel } from "./outcome-panel";

/**
 * /scan - the attendance screen.
 *
 * This page is where the printed QR code lands. There is no camera here: staff
 * point their own phone camera at the poster, and the phone opens this URL with
 * the office token in ?t=.
 *
 * The order of events is the product rule, written as code:
 *   1. resolve the token and load today - no location involved
 *   2. show the office and wait for a deliberate tap
 *   3. only then ask the browser for a position
 *   4. send it and render whatever the backend decides
 *
 * A dead token, a dead office, or a day that is already complete all stop at
 * step 1, so nobody is ever asked for GPS they did not need to give.
 */
export function ScanView() {
  const { state, record, retryOutcome } = useScan();

  switch (state.name) {
    case "no_token":
      return <NoToken />;

    case "resolving":
      return <LoadingState label="Checking the office code" />;

    case "unresolved":
      return <Unresolved resolution={state.resolution} />;

    case "ready":
      return (
        <Ready
          office={state.office}
          progress={state.progress}
          onRecord={() => record(state.office, state.progress)}
        />
      );

    case "locating":
      return <LoadingState label="Finding your location" />;

    case "submitting":
      return <LoadingState label="Recording your attendance" />;

    case "location_failed":
      return (
        <LocationFailed
          failure={state.failure}
          onRetry={() => record(state.office, state.progress)}
        />
      );

    case "outcome":
      return (
        <OutcomePanel
          outcome={state.outcome}
          onRetry={retryOutcome}
        />
      );

    default:
      return assertNever(state);
  }
}

function NoToken() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <QrCode aria-hidden="true" className="size-10 text-muted-foreground" />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">Scan the office code</h1>
        <p className="text-sm text-muted-foreground">
          Open your phone camera and point it at the attendance code printed at
          your office. It will bring you straight back here.
        </p>
      </div>
      <Button render={<Link href="/home" />} variant="outline" size="lg" className="mt-2 w-full">
        Back to home
      </Button>
    </div>
  );
}

function Ready({
  office,
  progress,
  onRecord,
}: {
  office: Office;
  progress: TodayProgress;
  onRecord: () => void;
}) {
  const complete = progress === "complete";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">You are scanning</p>
        <h1 className="text-2xl font-semibold text-foreground">{office.name}</h1>
        <p className="text-sm text-muted-foreground">{office.state}</p>
      </header>

      {complete ? (
        <p className="mt-8 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          You have already signed in and out today. Further scans are not
          recorded.
        </p>
      ) : (
        <p className="mt-8 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Your phone will ask for your location when you tap below. It is only
          used to confirm you are at this office.
        </p>
      )}

      {/* mt-auto pushes the action to the bottom of the fold, under the thumb,
          without a fixed position that would cover content. */}
      <div className="mt-auto flex flex-col gap-3 pt-8">
        {complete ? (
          <Button render={<Link href="/home" />} size="xl" className="w-full">
            Back to home
          </Button>
        ) : (
          <>
            <Button size="xl" onClick={onRecord} className="w-full">
              {progress === "signed_in" ? "Sign out" : "Sign in"}
            </Button>
            <Button render={<Link href="/home" />} variant="ghost" size="lg" className="w-full">
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function Unresolved({
  resolution,
}: {
  resolution: Exclude<ScanResolution, { kind: "resolved" }>;
}) {
  const { title, message } = describeResolution(resolution);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <QrCode aria-hidden="true" className="size-10 text-destructive" />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button render={<Link href="/home" />} variant="outline" size="lg" className="mt-2 w-full">
        Back to home
      </Button>
    </div>
  );
}

function describeResolution(resolution: Exclude<ScanResolution, { kind: "resolved" }>): {
  title: string;
  message: string;
} {
  switch (resolution.kind) {
    case "invalid_token":
      return {
        title: "This code is not valid",
        message:
          "It may have been reprinted since this poster went up. Ask your office admin for the current code.",
      };
    case "rate_limited":
      return {
        title: "Too many attempts",
        message: resolution.retryAfterSeconds
          ? `Wait ${resolution.retryAfterSeconds} seconds and scan again.`
          : "Wait a moment and scan again.",
      };
    case "offline":
      return {
        title: "You are offline",
        message: "We could not check the office code. Reconnect and scan again.",
      };
    case "error":
      return { title: "Something went wrong", message: resolution.message };
    default:
      return assertNever(resolution);
  }
}

function LocationFailed({
  failure,
  onRetry,
}: {
  failure: LocationFailure;
  onRetry: () => void;
}) {
  const { title, message, canRetry } = describeFailure(failure);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <MapPin aria-hidden="true" className="size-10 text-destructive" />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="mt-2 flex w-full flex-col gap-2">
        {canRetry ? (
          <Button size="xl" onClick={onRetry} className="w-full">
            Try again
          </Button>
        ) : null}
        <Button render={<Link href="/home" />} variant="outline" size="lg" className="w-full">
          Back to home
        </Button>
      </div>
    </div>
  );
}

function describeFailure(failure: LocationFailure): {
  title: string;
  message: string;
  canRetry: boolean;
} {
  switch (failure.kind) {
    case "permission_denied":
      return {
        title: "Location is blocked",
        message:
          "Attendance cannot be recorded without confirming you are at the office. Allow location for this site in your browser settings, then scan again.",
        // Retrying in the page does nothing once a browser has stored a denial.
        // The prompt will not reappear, so settings is the only route back.
        canRetry: false,
      };
    case "timed_out":
      return {
        title: "Could not find your location",
        message:
          "This often happens indoors. Step towards a window or outside the building and try again.",
        canRetry: true,
      };
    case "unavailable":
      return {
        title: "Location is not available",
        message:
          "Your phone could not provide a location. Check that location services are switched on.",
        canRetry: true,
      };
    default:
      return assertNever(failure);
  }
}
