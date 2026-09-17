"use client";

import { Camera, MapPin, QrCode } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { QrScanner } from "@/components/qr-scanner";
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

type ViewState =
  /** Reached from the nav tab rather than the printed code. */
  | { name: "no_token" }
  /** The in-app camera is open, looking for a code. */
  | { name: "scanning" }
  /** Something decoded, but it was not one of our office codes. */
  | { name: "wrong_code" }
  | { name: "resolving" }
  | {
      name: "unresolved";
      resolution: Exclude<ScanResolution, { kind: "resolved" }>;
    }
  | { name: "ready"; office: Office; progress: TodayProgress }
  | { name: "locating"; office: Office; progress: TodayProgress }
  | {
      name: "location_failed";
      office: Office;
      progress: TodayProgress;
      failure: LocationFailure;
    }
  | { name: "submitting"; office: Office }
  | { name: "outcome"; office: Office; outcome: AttendanceOutcome };

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
  const router = useRouter();
  const token = useSearchParams().get("t");
  const [state, setState] = useState<ViewState>(
    token ? { name: "resolving" } : { name: "no_token" },
  );

  /**
   * Handles whatever the in-app camera decoded.
   *
   * Rather than resolving the token here, it navigates to the same URL the
   * printed code would have opened. Both routes into this screen then run the
   * identical path, so there is one flow to reason about and not two.
   *
   * useCallback matters: the scanner restarts the camera whenever this function
   * changes identity, so an inline arrow would reopen the camera every render.
   */
  const handleScanResult = useCallback(
    (text: string) => {
      const scanned = tokenFromScan(text);
      if (!scanned) {
        setState({ name: "wrong_code" });
        return;
      }
      router.replace(`/scan?t=${encodeURIComponent(scanned)}`);
    },
    [router],
  );

  const cancelScanning = useCallback(() => setState({ name: "no_token" }), []);

  useEffect(() => {
    if (!token) return;
    let active = true;

    // Both calls go out together. today() only decides the wording of the
    // button, so it is not worth a second round trip after the token resolves.
    Promise.all([
      api.attendance.resolveToken(token),
      api.attendance.today(),
    ]).then(([resolution, today]) => {
      if (!active) return;

      if (resolution.kind !== "resolved") {
        setState({ name: "unresolved", resolution });
        return;
      }

      const day = today.kind === "success" ? today.day : null;
      const progress: TodayProgress = !day?.signInAt
        ? "not_started"
        : day.signOutAt
          ? "complete"
          : "signed_in";

      setState({ name: "ready", office: resolution.office, progress });
    });

    return () => {
      active = false;
    };
  }, [token]);

  const record = useCallback(
    async (office: Office, progress: TodayProgress) => {
      if (!token) return;

      setState({ name: "locating", office, progress });

      const position = await requestPosition();
      if (!position.ok) {
        setState({
          name: "location_failed",
          office,
          progress,
          failure: position.failure,
        });
        return;
      }

      const deviceId = getDeviceId();
      if (!deviceId) {
        setState({
          name: "outcome",
          office,
          outcome: {
            kind: "error",
            message:
              "This browser is blocking site data, so we cannot identify your phone.",
          },
        });
        return;
      }

      setState({ name: "submitting", office });

      const outcome = await api.attendance.submit({
        token,
        deviceId,
        coordinates: position.coordinates,
      });

      setState({ name: "outcome", office, outcome });
    },
    [token],
  );

  switch (state.name) {
    case "no_token":
      return <NoToken onOpenCamera={() => setState({ name: "scanning" })} />;

    case "scanning":
      return (
        <QrScanner onResult={handleScanResult} onCancel={cancelScanning} />
      );

    case "wrong_code":
      return (
        <WrongCode
          onRetry={() => setState({ name: "scanning" })}
          onCancel={cancelScanning}
        />
      );

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
      return <OutcomePanel outcome={state.outcome} onRetry={retryOutcome} />;

    default:
      return assertNever(state);
  }
}

/**
 * Pulls the office token out of whatever the camera decoded.
 *
 * Accepts the full URL the printed code actually holds, and also a bare token,
 * in case a code is ever printed without the surrounding address. Anything else
 * - a website, a payment code, someone else's QR - returns null and is reported
 * rather than sent to the backend.
 */
function tokenFromScan(text: string): string | null {
  const trimmed = text.trim();

  try {
    return new URL(trimmed).searchParams.get("t");
  } catch {
    // Not a URL. Accept it as a token only if it looks like one.
    return /^[A-Za-z0-9_-]{6,}$/.test(trimmed) ? trimmed : null;
  }
}

function NoToken({ onOpenCamera }: { onOpenCamera: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <QrCode aria-hidden="true" className="size-10 text-muted-foreground" />
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-foreground">
            Scan the office code
          </h1>
          <p className="text-sm text-muted-foreground">
            Point your camera at the attendance code displayed at your office.
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Button size="xl" onClick={onOpenCamera} className="w-full">
          <Camera aria-hidden="true" />
          Open camera
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          You can also use your phone camera app. It opens this page directly.
        </p>
        <Button
          render={<Link href="/home" />}
          nativeButton={false}
          variant="ghost"
          size="lg"
          className="w-full"
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}

function WrongCode({
  onRetry,
  onCancel,
}: {
  onRetry: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <QrCode aria-hidden="true" className="size-10 text-destructive" />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">
          That is not an office code
        </h1>
        <p className="text-sm text-muted-foreground">
          The code scanned, but it is not an NYSC attendance code. Check you are
          pointing at the right poster.
        </p>
      </div>
      <div className="mt-2 flex w-full flex-col gap-2">
        <Button size="xl" onClick={onRetry} className="w-full">
          Scan again
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onCancel}
          className="w-full"
        >
          Go back
        </Button>
      </div>
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
        <h1 className="text-2xl font-semibold text-foreground">
          {office.name}
        </h1>
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
          <Button
            render={<Link href="/home" />}
            nativeButton={false}
            size="xl"
            className="w-full"
          >
            Back to home
          </Button>
        ) : (
          <>
            <Button size="xl" onClick={onRecord} className="w-full">
              {progress === "signed_in" ? "Sign out" : "Sign in"}
            </Button>
            <Button
              render={<Link href="/home" />}
              nativeButton={false}
              variant="ghost"
              size="lg"
              className="w-full"
            >
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
      <Button
        render={<Link href="/home" />}
        nativeButton={false}
        variant="outline"
        size="lg"
        className="mt-2 w-full"
      >
        Back to home
      </Button>
    </div>
  );
}

function describeResolution(
  resolution: Exclude<ScanResolution, { kind: "resolved" }>,
): {
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
        message:
          "We could not check the office code. Reconnect and scan again.",
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
        <Button
          render={<Link href="/home" />}
          nativeButton={false}
          variant="outline"
          size="lg"
          className="w-full"
        >
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
