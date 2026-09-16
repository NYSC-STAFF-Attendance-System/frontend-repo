"use client";

import { ArrowRight, Clock, MapPin, QrCode } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useStaff } from "@/components/auth-provider";
import { Screen } from "@/components/screen";
import { ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDayLabel, timeFromIso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttendanceDay, TodayProgress, TodayResult } from "@/types";

type State =
  | { name: "loading" }
  | { name: "error"; message: string }
  | { name: "ready"; date: string; day: AttendanceDay | null };

function toState(result: TodayResult): State {
  if (result.kind === "success") {
    return { name: "ready", date: result.date, day: result.day };
  }
  return {
    name: "error",
    message:
      result.kind === "offline"
        ? "You appear to be offline. Your attendance is still safe on the server."
        : result.message,
  };
}

/**
 * Works out where the staff member is in their day from the two timestamps.
 *
 * Note this reads signInAt and signOutAt rather than day.status. status is the
 * backend judgement used for reporting - present, late, absent - and answers a
 * different question from "which button should this screen show".
 */
function progressOf(day: AttendanceDay | null): TodayProgress {
  if (!day?.signInAt) return "not_started";
  if (!day.signOutAt) return "signed_in";
  return "complete";
}

/**
 * /home - today at a glance.
 *
 * The main action sits within the fold at 375px, which is why this screen
 * carries no statistics and no history preview. Those live on /history.
 */
export default function HomePage() {
  const staff = useStaff();
  const [state, setState] = useState<State>({ name: "loading" });

  /**
   * Fetches today and returns a cleanup function that ignores a late response.
   *
   * Shaped this way so the effect and the retry button run exactly the same
   * code. When they were written separately, the retry path lost the real error
   * message and reported a generic one instead.
   *
   * It does not set the loading state itself: doing that synchronously inside
   * an effect forces an immediate second render. State already starts as
   * loading, and retry is an event handler, which can set it freely.
   */
  const fetchToday = useCallback(() => {
    let active = true;

    api.attendance.today().then((result) => {
      if (!active) return;
      setState(toState(result));
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => fetchToday(), [fetchToday]);

  function retry() {
    setState({ name: "loading" });
    fetchToday();
  }

  const firstName = staff.fullName.split(" ")[0];

  return (
    <Screen className="gap-5">
      <header className="pt-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hello, {firstName}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-3.5" />
          {staff.office.name}
        </p>
      </header>

      {state.name === "loading" ? <LoadingState label="Loading today" /> : null}

      {state.name === "error" ? (
        <ErrorState message={state.message} onRetry={retry} />
      ) : null}

      {state.name === "ready" ? <Today date={state.date} day={state.day} /> : null}
    </Screen>
  );
}

function Today({ date, day }: { date: string; day: AttendanceDay | null }) {
  const progress = progressOf(day);

  const headline =
    progress === "not_started"
      ? "Not signed in yet"
      : progress === "signed_in"
        ? "You are signed in"
        : "Day complete";

  return (
    <>
      <section
        className={cn(
          "rounded-2xl border p-5 shadow-sm transition-colors",
          progress === "complete"
            ? "border-success/25 bg-success/5"
            : progress === "signed_in"
              ? "border-primary/25 bg-primary/5"
              : "border-border bg-card",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {formatDayLabel(date)}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              progress === "complete"
                ? "bg-success/15 text-success"
                : progress === "signed_in"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                progress === "complete"
                  ? "bg-success"
                  : progress === "signed_in"
                    ? "bg-primary"
                    : "bg-muted-foreground/60",
              )}
            />
            {progress === "not_started" ? "Not started" : progress === "signed_in" ? "Active" : "Done"}
          </span>
        </div>

        <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {headline}
        </p>

        {/* Both slots always render, with a dash when empty, so the card keeps
            one height through the day instead of growing under the button. */}
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <TimeSlot label="Sign in" value={day?.signInAt ? timeFromIso(day.signInAt) : null} />
          <TimeSlot label="Sign out" value={day?.signOutAt ? timeFromIso(day.signOutAt) : null} />
        </dl>
      </section>

      {progress === "complete" ? (
        <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          You have signed in and out today. Nothing else to do.
        </p>
      ) : (
        <>
          <Button render={<Link href="/scan" />} nativeButton={false} size="xl" className="w-full">
            <QrCode aria-hidden="true" />
            {progress === "not_started" ? "Scan to sign in" : "Scan to sign out"}
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Point your camera at the code at your office. Your location is only
            checked at that moment.
          </p>
        </>
      )}
    </>
  );
}

function TimeSlot({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-3 py-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 text-lg font-semibold tabular-nums",
          value ? "text-foreground" : "text-muted-foreground/50",
        )}
      >
        {value ?? "--:--"}
      </dd>
    </div>
  );
}
