"use client";

import {
  Building2,
  Check,
  Copy,
  Expand,
  MapPin,
  Printer,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";

import { FilterSelect } from "@/app/admin/_components/filter-select";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useOfficeQr } from "../_hooks/use-office-qr";
import { KioskView } from "@/app/admin/settings/office-qr/_components/kiosk-view";
import { OfficeQrMark } from "@/app/admin/settings/office-qr/_components/office-qr-mark";
import { RegenerateDialog } from "@/app/admin/settings/office-qr/_components/regenerate-dialog";

export function OfficeQrPanel() {
  const qr = useOfficeQr();

  if (qr.status === "idle" || qr.status === "loading" || !qr.station) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <LoadingState label="Loading office QR" />
      </div>
    );
  }

  if (qr.status === "error") {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        {qr.message ?? "Could not load the office QR code."}
      </p>
    );
  }

  const { station } = qr;
  const active = station.acceptingScans;

  return (
    <div className="flex flex-col gap-5 print:gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between print:hidden">
        <div>
          <h1 className="text-[26px] leading-tight font-bold tracking-tight text-ink sm:text-[32px]">
            Office QR Code
          </h1>
          <p className="mt-2 max-w-xl text-sm text-olive-muted">
            Manage the authorized station QR code used by staff to access
            attendance verification at this office.
          </p>
        </div>
          <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={qr.printPoster}
            className="h-11 flex-1 rounded-xl border-line sm:flex-none"
          >
            <Printer data-icon="inline-start" className="size-4" />
            Print QR Poster
          </Button>
          <Button
            type="button"
            onClick={qr.openKiosk}
            className="h-11 flex-1 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90 sm:flex-none"
          >
            <Expand data-icon="inline-start" className="size-4" />
            Full Screen Kiosk Mode
          </Button>
        </div>
      </div>

      <section className="flex flex-wrap items-center gap-3 rounded-[20px] border border-line/80 bg-white px-4 py-3 print:hidden">
        <span className="flex size-9 items-center justify-center rounded-xl bg-nysc-muted text-nysc">
          <Building2 className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
            Active office station
          </p>
          <div className="mt-1 max-w-md">
            <FilterSelect
              aria-label="Active office station"
              value={station.stationId}
              onChange={() => undefined}
              options={[
                {
                  value: station.stationId,
                  label: `${station.officeName} (${station.stationId})`,
                },
              ]}
              className="h-10 rounded-xl"
            />
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            active ? "bg-mint text-nysc-dark" : "bg-danger-soft text-danger",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              active ? "bg-nysc-green" : "bg-danger",
            )}
          />
          Station Status: {active ? "Active" : "Inactive"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-olive-muted">
          <Users className="size-3.5" />
          Enrolled Staff: {station.enrolledStaff}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-olive-muted">
          <Building2 className="size-3.5" />
          Type: {station.officeType}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-olive-muted">
          <MapPin className="size-3.5" />
          Radius: {station.radiusM}m Centroid
        </span>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <section className="overflow-hidden rounded-[20px] border border-line/80 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
                Official office station
              </p>
              <h2 className="mt-1 text-lg font-bold text-ink">
                {station.stationName}
              </h2>
            </div>
            <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-bold tracking-wide text-nysc-dark uppercase">
              Station #1
            </span>
          </div>

          <div
            className={cn(
              "mt-5 rounded-[24px] border border-line/70 bg-nysc-soft p-6",
              !active && "opacity-50 grayscale",
            )}
          >
            <OfficeQrMark image={qr.image} officeName={station.officeName} />
            <div className="mt-5 text-center">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-nysc">
                <ScanLine className="size-4" />
                Scan with NYSC Staff Mobile App
              </p>
              <p className="mt-1 text-xs text-olive-muted">
                Authenticates device physical presence within the Maitama
                Centroid. Non-transferable station anchor.
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Meta label="Office name" value={station.officeName} />
            <Meta label="Station identifier" value={station.stationId} />
            <Meta label="Provisioned date" value={station.provisionedAt} />
            <Meta label="Last updated by" value={station.lastUpdatedBy} />
          </dl>

          <div className="mt-5 rounded-2xl border border-line/70 bg-surface-50 px-4 py-3">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
              Cryptographic station payload (public hash)
            </p>
            <div className="mt-2 flex items-start gap-2">
              <p className="min-w-0 flex-1 font-mono text-xs break-all text-ink">
                {station.payload}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={qr.copied ? "Copied" : "Copy scan URL"}
                onClick={() => void qr.copyPayload()}
                className="shrink-0 text-olive-muted"
              >
                {qr.copied ? (
                  <Check className="size-4 text-nysc" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 print:hidden">
            <Button
              type="button"
              onClick={qr.printPoster}
              className="h-11 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90"
            >
              <Printer data-icon="inline-start" className="size-4" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={qr.openKiosk}
              className="h-11 rounded-xl border-line"
            >
              <Expand data-icon="inline-start" className="size-4" />
              Lobby
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={qr.askRegenerate}
              className="h-11 rounded-xl text-olive-muted hover:text-ink"
            >
              <RefreshCw data-icon="inline-start" className="size-4" />
            </Button>
          </div>
        </section>

        <div className="flex flex-col gap-4 print:hidden">
          <section className="rounded-[20px] border border-line/80 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0  items-center justify-center rounded-full bg-nysc-muted text-nysc">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-ink">
                    Operational Status
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-olive-muted">
                    Staff scan this office QR code with their mobile devices to
                    initiate attendance verification. When active, staff within
                    the verified geofence perimeter ({station.radiusM}m) can
                    submit clock-in or clock-out requests.
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
                  active
                    ? "bg-mint text-nysc-dark"
                    : "bg-danger-soft text-danger",
                )}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-surface-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Accept Scans at this Station
                </p>
                <p className="mt-0.5 text-xs text-olive-muted">
                  Permits check-in requests for registered personnel
                </p>
              </div>
              <Switch
                checked={active}
                disabled={qr.busy}
                onCheckedChange={(checked) =>
                  void qr.toggleAccepting(Boolean(checked))
                }
                aria-label="Accept scans at this station"
                className="data-checked:bg-nysc"
              />
            </div>
          </section>

          <section className="rounded-[20px] border border-line/80 bg-white p-5">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
              Location vs. Identity
            </p>
            <h2 className="mt-1 text-lg font-bold text-ink">
              Civic Horizon Institutional Security Model
            </h2>
            <p className="mt-3 text-sm leading-6 text-olive-muted">
              <span className="font-semibold text-ink">
                One Office, One Static QR:
              </span>{" "}
              this office QR code solely verifies the physical presence anchor.
              Staff members do not receive individual QR badges. Individual
              identity is established exclusively through authenticated staff
              accounts and registered hardware devices.
            </p>
            <ol className="mt-4 space-y-3">
              <Pillar
                index={1}
                title="Physical Presence Pillar"
                body="Staff member physically reads the laminated station QR token mounted at the secretariat."
              />
              <Pillar
                index={2}
                title="Spatial Centroid Boundary"
                body={`Device GPS triangulation calculates radial compliance within the ${station.radiusM}m Maitama polygon.`}
              />
              <Pillar
                index={3}
                title="Cryptographic Device Signature"
                body="Payload is signed via Device Secure Enclave and tied to authenticated corps member profile."
              />
            </ol>
          </section>

          <section className="rounded-[20px] border border-line/80 bg-white p-5">
            <h2 className="text-lg font-bold text-ink">
              Mounting & Anti-Tamper Guide
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-olive-muted">
              <Guide
                icon={Check}
                title="Format"
                body="High-contrast matte lamination, minimum 200mm × 200mm dimensions to ensure fast camera autofocus."
              />
              <Guide
                icon={MapPin}
                title="Location"
                body="Primary reception desk, corps security muster point, and ICT entry corridor."
              />
              <Guide
                icon={ShieldAlert}
                title="Anti-Tamper Protocol"
                body="Inspection teams must confirm each morning that no unauthorized stickers or counterfeit QR overlays are placed atop the official placard."
              />
            </ul>
          </section>
        </div>
      </div>

      {qr.view === "kiosk" ? (
        <KioskView
          image={qr.image}
          officeName={station.officeName}
          stationName={station.stationName}
          active={active}
          onClose={qr.closeKiosk}
        />
      ) : null}

      {qr.confirming ? (
        <RegenerateDialog
          busy={qr.busy}
          onCancel={qr.cancelRegenerate}
          onConfirm={() => void qr.confirmRegenerate()}
        />
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Pillar({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-nysc text-[11px] font-bold text-white">
        {index}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-olive-muted">{body}</p>
      </div>
    </li>
  );
}

function Guide({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Check;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-nysc" />
      <p>
        <span className="font-semibold text-ink">{title}:</span> {body}
      </p>
    </li>
  );
}
