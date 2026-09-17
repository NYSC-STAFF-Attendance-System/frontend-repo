"use client";

import Link from "next/link";
import {
  Check,
  Clock,
  Globe,
  LogIn,
  LogOut,
  MapPin,
  QrCode,
  RotateCcw,
  Save,
  Shield,
} from "lucide-react";

import { FilterSelect } from "@/app/admin/_components/filter-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { cutoffFrom, useSettings } from "../_hooks/use-settings";

const graceOptions = [
  { value: "0", label: "0 minutes" },
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes+" },
  { value: "20", label: "20 minutes" },
  { value: "30", label: "30 minutes" },
];

const accuracyOptions = [
  { value: "10", label: "10 meters" },
  { value: "15", label: "15 meters" },
  { value: "20", label: "20 meters" },
  { value: "30", label: "30 meters" },
];

function formatClock(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const mer = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${mer}`;
}

export function SettingsPanel() {
  const { settings, lastSync, dirty, cutoff, patch, save, reset } =
    useSettings();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[32px] leading-none font-bold tracking-tight text-zinc-900">
            Settings
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Configure attendance rules, time thresholds, and hardware geofence
            validation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-nysc">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <Button
            type="button"
            disabled={!dirty}
            onClick={save}
            className="h-11 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90"
          >
            <Save data-icon="inline-start" className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-nysc-muted text-nysc">
                  <Clock className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Attendance Settings
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Standard duty hours and threshold rules for daily staff
                    logs.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-nysc-muted px-2.5 py-1 text-[10px] font-bold tracking-wide text-nysc uppercase">
                Shift Policy
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <TimeField
                label="Resumption Time"
                hint="Configurable start of shift window."
                value={settings.resumption}
                onChange={(value) => patch({ resumption: value })}
              />
              <TimeField
                label="Closing Time"
                hint="Standard shift closing time."
                value={settings.closing}
                onChange={(value) => patch({ closing: value })}
              />
              <div className="rounded-2xl border border-zinc-200/80 bg-[#f6f7f6] p-4">
                <Label className="text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
                  Grace Period
                </Label>
                <div className="mt-2">
                  <FilterSelect
                    aria-label="Grace period"
                    value={settings.grace}
                    onChange={(value) => patch({ grace: value })}
                    options={graceOptions}
                    className="h-10 rounded-xl bg-white"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Cutoff at {cutoff} before flagging.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#f6f7f6] px-4 py-3">
              <p className="text-sm font-semibold text-zinc-800">
                Late Arrival Enforcement Rule
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Staff arriving after the configured resumption time ({cutoff}{" "}
                including {settings.grace}-minute grace) are classified as Late.
                Arrivals past {cutoffFrom(settings.resumption, "90")} are barred
                from routine Check-In and need an Administrative Correction
                Form.
              </p>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                Active Operational Periods
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <PeriodCard
                  icon={LogIn}
                  period="Period 01"
                  title="Morning Check In"
                  window={`Authorized ${formatClock(addMinutes(settings.resumption, -60))} — ${formatClock(addMinutes(settings.resumption, 90))}`}
                  note="Validates prompt arrival for Secretariat muster roll."
                />
                <PeriodCard
                  icon={LogOut}
                  period="Period 02"
                  title="Evening Check Out"
                  window={`Authorized ${formatClock(addMinutes(settings.closing, -30))} — ${formatClock(addMinutes(settings.closing, 60))}`}
                  note="Validates full shift completion before dismissal."
                />
              </div>
            </div>
          </section>

          <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex shrink-0 size-9 items-center justify-center rounded-full bg-nysc-muted text-nysc">
                  <Shield className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Attendance Validation Rules
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Integrity checks preventing anonymous, duplicate, or
                    out-of-sequence attendance submissions.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-nysc-muted px-2.5 py-1 text-[10px] font-bold tracking-wide text-nysc uppercase">
                <Shield className="size-3 shrink-0" />
                Protected
              </span>
            </div>

            <div className="mt-5 divide-y divide-zinc-100">
              <RuleRow
                title="Prevent duplicate check-in"
                hint="Rejects multiple arrival scans on the same calendar day."
                checked={settings.preventDuplicateIn}
                onChange={(checked) => patch({ preventDuplicateIn: checked })}
              />
              <RuleRow
                title="Prevent duplicate check-out"
                hint="Restricts evening departure logs to a single validated event."
                checked={settings.preventDuplicateOut}
                onChange={(checked) => patch({ preventDuplicateOut: checked })}
              />
              <RuleRow
                title="Require valid check-in before check-out"
                hint="Disallows premature departure logging if no check-in exists."
                checked={settings.requireCheckInFirst}
                onChange={(checked) => patch({ requireCheckInFirst: checked })}
              />
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-nysc-muted text-nysc">
                  <MapPin className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    Location Verification
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Geofencing parameters for hardware GPS validation.
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.locationVerification}
                onCheckedChange={(checked) =>
                  patch({ locationVerification: checked })
                }
                aria-label="Location verification"
              />
            </div>

            <div
              className={cn(
                "mt-5",
                !settings.locationVerification &&
                  "pointer-events-none opacity-40",
              )}
            >
              <div className="flex flex-col items-center py-2">
                <div className="relative size-36">
                  <span className="absolute inset-0 rounded-full bg-nysc/10" />
                  <span className="absolute inset-6 rounded-full bg-nysc/20" />
                  <span className="absolute inset-12 rounded-full bg-nysc" />
                </div>
                <p className="mt-3 text-center text-xs text-zinc-400">
                  Active Perimeter
                  <span className="mt-0.5 block font-semibold text-nysc">
                    {settings.perimeterM}m Geo-radius
                  </span>
                </p>
              </div>

              <fieldset className="mt-4">
                <legend className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                  Verification Mode
                </legend>
                <div className="mt-2 space-y-2">
                  <ModeOption
                    checked={settings.verificationMode === "strict"}
                    onChange={() => patch({ verificationMode: "strict" })}
                    title="Strict Enforcement"
                    hint="Blocks check-in attempts outside authorized compound boundary."
                  />
                  <ModeOption
                    checked={settings.verificationMode === "flag"}
                    onChange={() => patch({ verificationMode: "flag" })}
                    title="Flag for Review"
                    hint="Permits check-in but appends a Location Warning flag to the audit log."
                  />
                </div>
              </fieldset>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                    Office Perimeter Radius
                  </Label>
                  <span className="text-sm font-semibold text-nysc">
                    {settings.perimeterM} Meters
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={150}
                  value={settings.perimeterM}
                  onChange={(event) =>
                    patch({ perimeterM: Number(event.target.value) })
                  }
                  className="mt-3 w-full accent-nysc"
                  aria-label="Office perimeter radius"
                />
                <p className="mt-2 text-xs text-zinc-400">
                  Configurable perimeter for station kiosk (recommended 30m –
                  150m).
                </p>
              </div>

              <div className="mt-4">
                <Label className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                  Minimum GPS Accuracy
                </Label>
                <div className="mt-2">
                  <FilterSelect
                    aria-label="Minimum GPS accuracy"
                    value={settings.minAccuracyM}
                    onChange={(value) => patch({ minAccuracyM: value })}
                    options={accuracyOptions}
                    className="h-10 rounded-xl"
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Rejects low-accuracy tower triangulations to prevent
                  coordinate spoofing.
                </p>
              </div>
            </div>
            <Button
              render={<Link href="/admin/settings/office-qr" />}
              variant="outline"
              className="mt-5 h-11 w-full rounded-xl border-line"
            >
              <QrCode data-icon="inline-start" className="size-4" />
              Manage Office QR Code
            </Button>
          </section>

          <section className="rounded-[20px] border border-zinc-200/80 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-nysc-muted text-nysc">
                  <Globe className="size-4" />
                </span>
                <h2 className="text-lg font-bold text-zinc-900">
                  System Timezone
                </h2>
              </div>
              <span className="rounded-full bg-nysc-muted px-2.5 py-1 text-[10px] font-bold tracking-wide text-nysc uppercase">
                Synchronized
              </span>
            </div>
            <p className="mt-4 text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              Official Timezone
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-900">
              Africa/Lagos (WAT)
              <span className="ml-2 text-sm font-medium text-zinc-400">
                GMT +1
              </span>
            </p>
            <p className="mt-4 text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
              Deployment Centroid
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-800">
              FCT Abuja Central Secretariat
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Initial Pilot Deployment Station #01
            </p>
            <p className="mt-4 text-xs leading-5 text-zinc-400">
              Attendance timestamps use this official deployment timezone. All
              system-generated audit entries are timestamped in Africa/Lagos
              WAT.
            </p>
          </section>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-zinc-400">
          <Check className="size-3.5 text-nysc" />
          {dirty ? "Unsaved changes" : "All changes saved to cloud"}
          <span className="text-zinc-300">·</span>
          Last administrative sync: {lastSync}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            className="h-11 rounded-xl text-zinc-500 hover:text-zinc-800"
          >
            <RotateCcw data-icon="inline-start" className="size-4" />
            Reset to Defaults
          </Button>
          <Button
            type="button"
            disabled={!dirty}
            onClick={save}
            className="h-11 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90"
          >
            <Save data-icon="inline-start" className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function addMinutes(value: string, delta: number) {
  const [hours, minutes] = value.split(":").map(Number);
  const total = (hours * 60 + minutes + delta + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function TimeField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-[#f6f7f6] p-4">
      <Label className="text-[10px] font-semibold tracking-[0.12em] text-zinc-400 uppercase">
        {label}
      </Label>
      <Input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="mt-2 h-auto border-0 bg-transparent p-0 text-[22px] leading-none font-bold tracking-tight text-zinc-900 shadow-none focus-visible:border-transparent focus-visible:ring-0"
      />
      <p className="mt-2 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

function PeriodCard({
  icon: Icon,
  period,
  title,
  window,
  note,
}: {
  icon: typeof LogIn;
  period: string;
  title: string;
  window: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-nysc/15 bg-nysc-muted/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-nysc">
          <Icon className="size-4" />
          {period}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide text-nysc uppercase">
          Active
        </span>
      </div>
      <p className="mt-2 text-sm font-bold text-zinc-900">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{window}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-400">{note}</p>
    </div>
  );
}

function RuleRow({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-zinc-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-400">{hint}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
        aria-label={title}
      />
    </div>
  );
}

function ModeOption({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200/80 px-3 py-3">
      <input
        type="radio"
        name="verification-mode"
        checked={checked}
        onChange={onChange}
        className="mt-1 size-4 accent-nysc"
      />
      <span>
        <span className="block text-sm font-semibold text-zinc-800">
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-zinc-400">
          {hint}
        </span>
      </span>
    </label>
  );
}
