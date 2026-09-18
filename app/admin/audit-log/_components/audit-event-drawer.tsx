"use client"

import {
  CheckCircle2,
  CircleX,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { AuditEventDetail } from "../_data"

function SectionLabel({
  children,
  trailing,
}: {
  children: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
        {children}
      </p>
      {trailing}
    </div>
  )
}

function downloadAttachment(name: string) {
  const blob = new Blob([`NYSC audit attachment: ${name}\n`], {
    type: "text/plain",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

export function AuditEventDrawer({ detail }: { detail: AuditEventDetail }) {
  return (
    <>
      <SheetHeader className="gap-1 border-b border-line px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-nysc-green px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                SEC-AUDIT
              </span>
              <span className="font-mono text-[11px] text-olive-muted">
                {detail.auditCode}
              </span>
            </div>
            <SheetTitle className="mt-2 text-lg font-bold tracking-tight text-ink">
              Audit Event Detail
            </SheetTitle>
            <SheetDescription className="mt-1 flex items-center gap-1.5 text-xs text-olive-muted">
              <span className="size-1.5 rounded-full bg-nysc-green" />
              {detail.date} • {detail.time}
            </SheetDescription>
          </div>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-slate hover:text-ink"
                aria-label="Close inspector"
              />
            }
          >
            <X className="size-4" />
          </SheetClose>
        </div>
      </SheetHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <section>
          <SectionLabel
            trailing={
              <span className="rounded-full bg-nysc-green px-2.5 py-1 text-[10px] font-semibold text-white">
                {detail.actorBadge}
              </span>
            }
          >
            Authorizing Actor
          </SectionLabel>
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-[11px] font-semibold text-nysc-green">
              {detail.initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{detail.user}</p>
              <p className="text-xs text-olive-muted">{detail.actorTitle}</p>
              <p className="text-[11px] text-slate">ID: {detail.userId}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] text-olive-muted uppercase">
                Network Origin
              </p>
              <p className="mt-1 font-mono text-xs text-ink">{detail.ip}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] text-olive-muted uppercase">
                Access Portal
              </p>
              <p className="mt-1 text-xs text-ink">{detail.portal}</p>
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>Action & Module</SectionLabel>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-semibold",
                  detail.privileged ? "text-danger-muted" : "text-nysc-green"
                )}
              >
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
                {detail.action}
              </p>
              <p className="mt-1 text-xs leading-5 text-olive-muted">
                Module: {detail.policy}
              </p>
            </div>
            {detail.privileged ? (
              <span className="shrink-0 rounded-md bg-danger-soft px-2 py-1 text-center text-[10px] font-semibold leading-4 text-danger-muted">
                Privileged Override
              </span>
            ) : null}
          </div>
        </section>

        <section>
          <SectionLabel>Affected Record</SectionLabel>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-50 text-[11px] font-semibold text-ink">
                {detail.affectedInitials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {detail.affectedName}
                </p>
                <p className="truncate text-xs text-olive-muted">
                  {detail.affectedMeta}
                </p>
              </div>
            </div>
            <span className="shrink-0 font-mono text-[11px] font-semibold text-nysc-green">
              {detail.recordCode}
            </span>
          </div>
        </section>

        {detail.previousValue && detail.newValue ? (
          <section>
            <SectionLabel
              trailing={
                <span className="text-[10px] font-semibold tracking-[0.12em] text-olive-muted uppercase">
                  Field Audit Diff
                </span>
              }
            >
              Record Value Alterations
            </SectionLabel>
            <p className="mb-2 text-xs font-medium text-ink">
              {detail.action === "Attendance Corrected"
                ? "Attendance Status & Verification"
                : "Record change"}
            </p>
            <div className="space-y-2">
              <div className="rounded-xl bg-danger-soft px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-danger uppercase">
                  <CircleX className="size-3.5" />
                  Previous Value
                </p>
                <p className="mt-1 text-sm font-medium text-danger">
                  {detail.previousValue}
                </p>
              </div>
              <div className="rounded-xl bg-mint px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-nysc-dark uppercase">
                  <CheckCircle2 className="size-3.5" />
                  New Value
                </p>
                <p className="mt-1 text-sm font-medium text-nysc-dark">
                  {detail.newValue}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {detail.reason ? (
          <section>
            <SectionLabel>Reason / Justification</SectionLabel>
            <div className="rounded-xl border border-line bg-surface-50 px-3 py-3">
              <p className="text-sm leading-6 text-ink">
                “{detail.reason}”
              </p>
              {detail.authorizedBy ? (
                <p className="mt-2 text-xs text-olive-muted">
                  Authorized by {detail.authorizedBy}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {detail.attachment ? (
          <section>
            <SectionLabel>Attached Verification Proof</SectionLabel>
            <div className="flex items-center gap-3 rounded-xl border border-line px-3 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {detail.attachment.name}
                </p>
                <p className="text-xs text-olive-muted">
                  {detail.attachment.size} • {detail.attachment.note}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-nysc-green hover:text-nysc-dark"
                aria-label="Download attachment"
                onClick={() => downloadAttachment(detail.attachment!.name)}
              >
                <Download className="size-4" />
              </Button>
            </div>
          </section>
        ) : null}

        <section className="rounded-xl border border-mint bg-cream p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-nysc-dark uppercase">
              Tamper-Proof Cryptographic Hash
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-nysc-dark">
              <ShieldCheck className="size-3" />
              Verified Immutable
            </span>
          </div>
          <p className="mt-2 break-all font-mono text-[11px] leading-5 text-ink">
            SHA-256: {detail.hash}
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-olive-muted">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-nysc-green" />
            Cryptographically anchored. No subsequent tampering recorded.
          </p>
        </section>
      </div>

      <SheetFooter className="flex-row flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
        <SheetClose
          render={
            <Button
              variant="ghost"
              className="h-10 px-2 text-olive-muted hover:text-ink"
            />
          }
        >
          Close Inspector
        </SheetClose>
        <div className="flex items-center gap-2">
          <SheetClose
            render={
              <Button
                variant="outline"
                className="h-10 rounded-xl border-line bg-white px-4 text-ink"
              />
            }
          >
            Dismiss
          </SheetClose>
          <Button
            type="button"
            className="h-10 rounded-xl bg-nysc-green px-4 text-white hover:bg-nysc-green/90"
            onClick={() => window.print()}
          >
            <Printer data-icon="inline-start" className="size-4" />
            Print Certificate
          </Button>
        </div>
      </SheetFooter>
    </>
  )
}
