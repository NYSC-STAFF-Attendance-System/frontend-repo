"use client";

import { useState } from "react";
import Image from "next/image";
import { useAttendanceCorrection } from "../_hooks/use-attendance-correction";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FileText,
  Lock,
  MapPin,
  RefreshCcw,
  Save,
  Shield,
  ShieldCheck,
  Smartphone,
  Upload,
  X,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  clockToMinutes,
  type AttendanceRecord,
  type AttendanceStatus,
} from "../_data";

type OverrideStatus = "present" | "excused" | "late";

const statusLabel: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  "checked-out": "Present",
  incomplete: "Incomplete",
};

const overrideLabel: Record<OverrideStatus, string> = {
  present: "Present",
  excused: "Excused",
  late: "Late",
};

function splitClock(value: string | null) {
  if (!value) return { time: "-- : --", mer: "" };
  const [time, mer] = value.split(" ");
  return { time, mer: mer ?? "" };
}

function formatDelta(original: string | null, next: string) {
  const from = clockToMinutes(original);
  const to = clockToMinutes(next);
  if (to == null) return "—";
  if (from == null) return "Session completed";
  const mins = to - from;
  if (mins === 0) return "Unchanged";
  const abs = Math.abs(mins);
  const hours = Math.floor(abs / 60);
  const remainder = abs % 60;
  const amount = hours > 0 ? `${hours}h ${remainder}m` : `${remainder}m`;
  return `${mins < 0 ? "−" : "+"}${amount}`;
}

function StaffPhoto({ record }: { record: AttendanceRecord }) {
  const [failed, setFailed] = useState(false);
  const photo = record.photo;

  if (record.avatar === "photo" && photo && !failed) {
    return (
      <Image
        src={photo}
        alt={record.name}
        width={48}
        height={48}
        className="size-12 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-nysc">
      {record.initials}
    </span>
  );
}

export function AttendanceCorrection({ record }: { record: AttendanceRecord }) {
  const {
    detailsHref,
    meta,
    fileInput,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    override,
    setOverride,
    reason,
    setReason,
    fileName,
    setFileName,
    saved,
    setSaved,
    canSave,
    originalLate,
    resetFields,
    handleSave,
  } = useAttendanceCorrection(record);
  const originalIn = splitClock(record.checkIn);
  const originalOut = splitClock(record.checkOut);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href={detailsHref}
            aria-label="Back"
            title="Back"
            className={buttonVariants({
              variant: "ghost",
              size: "icon-lg",
              className: "text-nysc hover:bg-nysc-muted hover:text-nysc",
            })}
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-[26px] leading-tight font-bold tracking-tight text-zinc-900 sm:text-[32px]">
              Correct Attendance Record
            </h1>
          <p className="mt-2 min-w-0 text-sm break-words text-zinc-500">
              {record.name} · {record.staffId} · {meta.fullDate}
            </p>
          </div>
        </div>
        <span
          className="flex size-10 items-center justify-center rounded-full bg-nysc-muted text-nysc"
          title="Admin privileges active"
        >
          <ShieldCheck className="size-5" />
        </span>
      </div>

      <section className="flex items-center gap-3 rounded-[20px] border border-rose-100 bg-[#fdeeee] px-4 py-3">
        <Shield className="size-4 shrink-0 text-rose-500" />
        <p className="text-sm text-zinc-600">
          Corrections are logged and cannot be undone.
        </p>
        <Lock className="ml-auto size-4 shrink-0 text-rose-400" />
      </section>

      <section className="flex flex-col gap-4 rounded-[20px] border border-zinc-200/80 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <StaffPhoto record={record} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900">
                {record.name}
              </h2>
              <Check className="size-4 text-nysc" aria-label="Active" />
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="size-3 text-zinc-400" />
              {record.department} · {record.location}
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold tracking-wide text-zinc-800 sm:text-right">
          {meta.recordCode}
        </p>
      </section>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-[20px] border border-zinc-200/80 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-zinc-900">Current Record</h3>
            <Lock className="size-4 text-zinc-400" aria-label="Read-only" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                Check-in
              </p>
              <p
                className={cn(
                  "mt-1 text-[32px] leading-none font-bold tracking-tight",
                  originalLate ? "text-rose-500" : "text-zinc-900",
                )}
              >
                {originalIn.time}
                {originalIn.mer ? (
                  <span className="ml-1 text-lg font-bold">
                    {originalIn.mer}
                  </span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                Check-out
              </p>
              <p
                className={cn(
                  "mt-1 text-[32px] leading-none font-bold tracking-tight",
                  record.checkOut ? "text-zinc-900" : "text-zinc-300",
                )}
              >
                {originalOut.time}
                {originalOut.mer ? (
                  <span className="ml-1 text-lg font-bold">
                    {originalOut.mer}
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                originalLate
                  ? "bg-rose-50 text-rose-500"
                  : "bg-nysc-muted text-nysc",
              )}
            >
              {originalLate ? "Late" : statusLabel[record.status]}
            </span>
          </div>

          <div className="mt-6 space-y-3 border-t border-zinc-100 pt-5">
            <ProofRow
              icon={MapPin}
              body={`${meta.distanceM}m · ${meta.lat.toFixed(4)}° N, ${meta.lon.toFixed(4)}° E`}
            />
            <ProofRow
              icon={Smartphone}
              body={`${meta.authenticator} · #${meta.sessionId}`}
            />
            <ProofRow icon={Shield} body={meta.terminal} />
          </div>
        </section>

        <section className="min-w-0 rounded-[20px] border border-zinc-200/80 bg-white p-5">
          <h3 className="text-lg font-bold text-zinc-900">Correction</h3>

          <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
            <ProposedTimeCard
              label="Check-in"
              was={record.checkIn ?? "—"}
              value={checkIn}
              onChange={(value) => {
                setCheckIn(value);
                setSaved(false);
              }}
            />
            <ProposedTimeCard
              label="Check-out"
              was={record.checkOut ?? "—"}
              value={checkOut}
              onChange={(value) => {
                setCheckOut(value);
                setSaved(false);
              }}
            />
          </div>

          <fieldset className="mt-5">
            <legend className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              Status
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(
                [
                  ["present", "Present"],
                  ["excused", "Excused"],
                  ["late", "Late"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setOverride(value);
                    setSaved(false);
                  }}
                  className={cn(
                    "h-10 rounded-full border px-2 text-center text-sm font-semibold",
                    override === value
                      ? "border-nysc bg-nysc-muted text-nysc"
                      : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 space-y-2">
            <Label
              htmlFor="correction-reason"
              className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase"
            >
              Reason
            </Label>
            <Textarea
              id="correction-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setSaved(false);
              }}
              className="min-h-28 rounded-2xl border-zinc-200 text-sm shadow-none"
            />
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-nysc/15 bg-nysc-muted/50 px-4 py-3">
            <FileText className="size-4 shrink-0 text-nysc" />
            <p className="min-w-0 flex-1 truncate text-sm text-zinc-700">
              {fileName}
            </p>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf"
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                setSaved(false);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Replace file"
              title="Replace file"
              className="size-9 rounded-full border-nysc/30 bg-white text-nysc hover:bg-nysc-muted"
              onClick={() => fileInput.current?.click()}
            >
              <Upload className="size-4" />
            </Button>
          </div>
        </section>
      </div>

      <section className="rounded-[20px] border border-nysc/15 bg-[#e7f6ee] p-5">
        <h3 className="inline-flex items-center gap-2 text-lg font-bold text-zinc-900">
          <ArrowUpRight className="size-5 text-nysc" />
          Changes
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <DiffCard
            label="Check-in"
            original={record.checkIn ?? "-- : --"}
            next={checkIn}
            note={formatDelta(record.checkIn, checkIn)}
          />
          <DiffCard
            label="Check-out"
            original={record.checkOut ?? "-- : --"}
            next={checkOut}
            note={
              record.checkOut
                ? formatDelta(record.checkOut, checkOut)
                : "Session completed"
            }
          />
          <div className="rounded-2xl bg-white p-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              Status
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  originalLate
                    ? "bg-rose-50 text-rose-500"
                    : "bg-zinc-100 text-zinc-500",
                )}
              >
                {originalLate ? "Late" : statusLabel[record.status]}
              </span>
              <span className="text-zinc-300">→</span>
              <span className="rounded-full bg-nysc-muted px-2.5 py-1 text-xs font-semibold text-nysc">
                {overrideLabel[override]}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        {saved ? (
          <Check className="mr-auto size-5 text-nysc" aria-label="Saved" />
        ) : null}
        <Link
          href={detailsHref}
          aria-label="Cancel"
          title="Cancel"
          className={buttonVariants({
            variant: "outline",
            size: "icon-lg",
            className:
              "rounded-xl border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800",
          })}
        >
          <X className="size-5" />
        </Link>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Reset"
          title="Reset"
          className="rounded-xl border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800"
          onClick={resetFields}
        >
          <RefreshCcw className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-lg"
          disabled={!canSave}
          aria-label="Save"
          title="Save"
          onClick={handleSave}
          className="rounded-xl bg-nysc text-white hover:bg-nysc/90"
        >
          <Save className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function ProofRow({ icon: Icon, body }: { icon: typeof MapPin; body: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-nysc-muted text-nysc">
        <Icon className="size-4" />
      </span>
      <p className="text-xs leading-5 text-zinc-500">{body}</p>
    </div>
  );
}

function ProposedTimeCard({
  label,
  was,
  value,
  onChange,
}: {
  label: string;
  was: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [time, mer = "AM"] = value.split(" ");

  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200/80 bg-[#f3f6f4] p-4">
      <div className="flex items-start justify-between gap-2">
        <Label className="text-[10px] leading-4 font-semibold tracking-[0.08em] text-zinc-400 uppercase">
          {label}
        </Label>
        <span className="shrink-0 text-[10px] leading-4 text-zinc-400">
          {was}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <Input
          value={time}
          onChange={(event) => onChange(`${event.target.value} ${mer}`)}
          aria-label={label}
          className="h-auto w-22 border-0 bg-transparent p-0 text-[28px] leading-none font-bold tracking-tight text-zinc-900 shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />
        <span className="text-sm font-semibold text-zinc-500">{mer}</span>
      </div>
    </div>
  );
}

function DiffCard({
  label,
  original,
  next,
  note,
}: {
  label: string;
  original: string;
  next: string;
  note: string;
}) {
  const hasOriginal = original !== "-- : --";
  const changed = original !== next;

  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          className={cn(
            "text-lg font-bold",
            changed && hasOriginal
              ? "text-rose-500 line-through decoration-rose-300"
              : "text-zinc-300",
          )}
        >
          {hasOriginal ? splitClock(original).time : original}
        </p>
        <p className="text-lg font-bold text-nysc">{next}</p>
      </div>
      <p className="mt-2 text-xs font-medium text-nysc">{note}</p>
    </div>
  );
}
