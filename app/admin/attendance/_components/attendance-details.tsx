"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock,
  FilePenLine,
  Link2,
  LogIn,
  LogOut,
  MapPin,
  QrCode,
  Shield,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getAttendanceDetail,
  type AttendanceRecord,
  type AttendanceStatus,
  type VerificationFlag,
} from "../_data";

const statusLabel: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  "checked-out": "Checked Out",
  incomplete: "Incomplete",
};

const statusClass: Record<AttendanceStatus, string> = {
  present: "bg-nysc-muted text-nysc",
  late: "bg-amber-50 text-amber-600",
  absent: "bg-rose-50 text-rose-500",
  "checked-out": "bg-emerald-100 text-nysc",
  incomplete: "bg-amber-50 text-amber-600",
};

const avatarClass = {
  green: "bg-emerald-100 text-nysc",
  gray: "bg-zinc-200 text-zinc-600",
  mint: "bg-emerald-50 text-nysc",
} as const;

function ProfilePhoto({ record }: { record: AttendanceRecord }) {
  const [failed, setFailed] = useState(false);
  const photo = record.photo?.replace("w=96&h=96", "w=256&h=256");

  if (record.avatar === "photo" && photo && !failed) {
    return (
      <Image
        src={photo}
        alt={record.name}
        width={104}
        height={104}
        className="size-26 rounded-full object-cover ring-4 ring-white shadow-[0_8px_24px_rgba(16,24,40,0.08)]"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-26 items-center justify-center rounded-full text-2xl font-semibold ring-4 ring-white",
        avatarClass[record.avatar === "photo" ? "gray" : record.avatar],
      )}
    >
      {record.initials}
    </span>
  );
}

function splitClock(value: string | null) {
  if (!value) return { time: "—", mer: "" };
  const [time, mer] = value.split(" ");
  return { time, mer: mer ?? "" };
}

function FlagCard({ flag }: { flag: VerificationFlag }) {
  const Icon =
    flag.title === "Trusted Device"
      ? Shield
      : flag.title === "Office QR"
        ? QrCode
        : Link2;

  return (
    <div className="relative rounded-2xl bg-[#f4f6f5] px-2.5 pb-3 pt-3">
      <span
        className={cn(
          "absolute top-2 right-2 flex size-4 items-center justify-center rounded-full",
          flag.ok ? "bg-nysc text-white" : "bg-zinc-300 text-white",
        )}
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
      <Icon className="size-4 text-zinc-400" />
      <p className="mt-3 pr-3 text-[11px] leading-tight font-semibold text-zinc-500">
        {flag.title}
      </p>
      <p
        className={cn(
          "mt-1 text-[13px] leading-tight font-semibold",
          flag.ok ? "text-nysc" : "text-rose-500",
        )}
      >
        {flag.status}
      </p>
      <p className="mt-1 text-[10px] leading-snug text-zinc-400">{flag.hint}</p>
    </div>
  );
}

export function AttendanceDetails({ record }: { record: AttendanceRecord }) {
  const detail = getAttendanceDetail(record);
  const checkIn = splitClock(record.checkIn);
  const checkOut = splitClock(record.checkOut);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[32px] leading-none font-bold tracking-tight text-zinc-900">
          Attendance Details
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/attendance"
            className={buttonVariants({
              variant: "outline",
              className:
                "h-11 rounded-xl border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50",
            })}
          >
            <ArrowLeft data-icon="inline-start" className="size-4" />
            Back
          </Link>
          <Link
            href={`/admin/attendance/${record.id}/correct`}
            className={buttonVariants({
              className:
                "h-11 rounded-xl bg-nysc px-4 text-sm font-semibold text-white hover:bg-nysc/90",
            })}
          >
            <FilePenLine data-icon="inline-start" className="size-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[252px_minmax(0,1fr)]">
        <section className="rounded-[20px] border border-zinc-200/80 bg-white px-6 py-8 text-center">
          <div className="flex justify-center">
            <ProfilePhoto record={record} />
          </div>
          <h2 className="mt-5 text-lg font-bold tracking-tight text-zinc-900">
            {record.name}
          </h2>
          <span className="mt-2 inline-flex rounded-full bg-nysc-muted px-3 py-1 text-[11px] font-semibold tracking-wide text-nysc">
            {record.staffId}
          </span>
          <div className="mt-6 space-y-4 border-t border-zinc-100 pt-5 text-left">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 size-4 shrink-0 text-zinc-400" />
              <div>
                <p className="text-[11px] font-medium text-zinc-400">
                  Department
                </p>
                <p className="text-sm font-semibold text-zinc-800">
                  {record.department}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-zinc-400" />
              <div>
                <p className="text-[11px] font-medium text-zinc-400">
                  Office Location
                </p>
                <p className="text-sm font-semibold text-zinc-800">
                  {record.location}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-nysc-muted text-nysc">
              <MapPin className="size-4" />
            </span>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">
              Location Verification
            </h3>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_236px]">
            <div className="relative overflow-hidden rounded-2xl bg-zinc-100">
              <iframe
                title={`${record.name} clock-in location`}
                src={detail.mapUrl}
                className="pointer-events-none h-62 w-full border-0 lg:h-67"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white to-transparent" />
              <span className="absolute top-3 right-3 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500 shadow-sm">
                Live GPS
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div
                className={cn(
                  "rounded-xl border px-3.5 py-3",
                  detail.gpsVerified
                    ? "border-nysc/30 bg-white"
                    : "border-rose-200 bg-white",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium text-zinc-400">
                    GPS Status
                  </p>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      detail.gpsVerified
                        ? "bg-nysc-muted text-nysc"
                        : "bg-rose-50 text-rose-500",
                    )}
                  >
                    {detail.gpsStatusLabel}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 text-[15px] leading-tight font-bold",
                    detail.gpsVerified ? "text-nysc" : "text-rose-500",
                  )}
                >
                  {detail.gpsHeadline}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-zinc-400">
                    Distance from Station
                  </p>
                  <p className="mt-1 text-sm font-bold text-zinc-800">
                    {detail.distanceM == null
                      ? "—"
                      : `${detail.distanceM} meters`}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400">Permitted Radius</p>
                  <p className="mt-1 text-sm font-bold text-zinc-800">
                    {detail.permittedRadiusM} meters
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-zinc-400">GPS Accuracy</p>
                <p className="mt-1 text-sm font-bold text-zinc-800">
                  {detail.accuracy}
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <p className="text-[11px] text-zinc-400">
                  Designated Station Centroid
                </p>
                <p className="mt-1 text-sm leading-snug font-semibold text-zinc-700">
                  {detail.station}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[252px_minmax(0,1fr)_minmax(320px,360px)]">
        <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
              {record.date}
            </p>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
                statusClass[record.status],
              )}
            >
              {statusLabel[record.status]}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-zinc-400">Clock In</p>
              <div className="mt-2 flex items-start gap-2">
                <LogIn className="mt-1 size-4 shrink-0 text-nysc" />
                <p className="text-[28px] leading-[0.95] font-bold tracking-tight text-zinc-900">
                  {checkIn.time}
                  {checkIn.mer ? (
                    <span className="mt-0.5 block text-lg font-bold">
                      {checkIn.mer}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400">Clock Out</p>
              <div className="mt-2 flex items-start gap-2">
                <LogOut className="mt-1 size-4 shrink-0 text-zinc-400" />
                <p className="text-[28px] leading-[0.95] font-bold tracking-tight text-zinc-900">
                  {checkOut.time}
                  {checkOut.mer ? (
                    <span className="mt-0.5 block text-lg font-bold">
                      {checkOut.mer}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f4f6f5] px-3.5 py-3">
            <span className="flex items-center gap-2 text-sm text-zinc-500">
              <Clock className="size-4 text-zinc-400" />
              Total Duration
            </span>
            <span className="text-sm font-bold text-zinc-800">
              {detail.duration}
            </span>
          </div>
        </section>

        <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">
              Technical Metadata
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-semibold",
                detail.auditValid ? "text-nysc" : "text-rose-500",
              )}
            >
              <ShieldCheck className="size-4" />
              {detail.auditValid ? "Audit Valid" : "Audit Flagged"}
            </span>
          </div>

          <div className="mt-5 space-y-5">
            <MetaRow
              icon={Smartphone}
              label="Device & Platform"
              value={detail.device}
            />
            <MetaRow
              icon={Shield}
              label="Registered Binding Status"
              value={detail.bindingStatus}
            />
            <MetaRow
              icon={QrCode}
              label="Physical Station Checkpoint"
              value={`Office QR: ${detail.qr}`}
              tone="mint"
            />
            <MetaRow
              icon={Clock}
              label="Server Timestamp"
              value={detail.serverTimestamp}
            />
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
            <h3 className="mb-4 text-lg font-bold tracking-tight text-zinc-900">
              Verification Flags
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              <FlagCard flag={detail.flags.trustedDevice} />
              <FlagCard flag={detail.flags.officeQr} />
              <FlagCard flag={detail.flags.gpsPerimeter} />
            </div>
          </section>

          <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-nysc-muted text-nysc">
                <Shield className="size-3.5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">
                  Radius & Escalation Policy
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  Records registered within the 50m geofence are automatically
                  approved. Any submission flagged as &quot;Outside Radius&quot;
                  is held for admin review.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  tone = "gray",
}: {
  icon: typeof Smartphone;
  label: string;
  value: string;
  tone?: "gray" | "mint";
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          tone === "mint"
            ? "bg-nysc-muted text-nysc"
            : "bg-zinc-100 text-zinc-500",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[11px] font-medium text-zinc-400">{label}</p>
        <p className="text-sm leading-snug font-semibold text-zinc-800">
          {value}
        </p>
      </div>
    </div>
  );
}
