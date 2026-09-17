"use client";

import { ArrowRight, Clock, MapPin, QrCode } from "lucide-react";
import Link from "next/link";
import { progressOf, useHome } from "./use-home";
import { Screen } from "@/components/screen";
import { ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { formatDayLabel, timeFromIso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttendanceDay } from "@/types";

export default function HomePage() {
  const { staff, firstName, state, retry } = useHome();

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

      {state.name === "ready" ? (
        <Today date={state.date} day={state.day} />
      ) : null}
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
            {progress === "not_started"
              ? "Not started"
              : progress === "signed_in"
                ? "Active"
                : "Done"}
          </span>
        </div>

        <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {headline}
        </p>

        {/* Both slots always render, with a dash when empty, so the card keeps
            one height through the day instead of growing under the button. */}
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <TimeSlot
            label="Sign in"
            value={day?.signInAt ? timeFromIso(day.signInAt) : null}
          />
          <TimeSlot
            label="Sign out"
            value={day?.signOutAt ? timeFromIso(day.signOutAt) : null}
          />
        </dl>
      </section>

      {progress === "complete" ? (
        <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          You have signed in and out today. Nothing else to do.
        </p>
      ) : (
        <>
          <Button render={<Link href="/scan" />} size="xl" className="w-full">
            <QrCode aria-hidden="true" />
            {progress === "not_started"
              ? "Scan to sign in"
              : "Scan to sign out"}
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
        {value ?? "-- : --"}
      </dd>
    </div>
  );
}
