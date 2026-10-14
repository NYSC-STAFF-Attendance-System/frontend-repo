"use client"

import { Button } from "@/components/ui/button"

export function RegenerateDialog({
  busy,
  onCancel,
  onConfirm,
}: {
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/30 px-4 print:hidden">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="regenerate-qr-title"
        className="w-full max-w-md rounded-[24px] border border-line bg-white p-6 shadow-[0_24px_80px_rgba(16,24,40,0.18)]"
      >
        <h2 id="regenerate-qr-title" className="text-xl font-bold text-ink">
          Regenerate station token?
        </h2>
        <p className="mt-2 text-sm leading-6 text-olive-muted">
          Printed posters using the current code will stop working immediately.
          Staff will need the new QR before they can sign in at this office.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onCancel}
            className="h-11 rounded-xl"
          >
            Keep current code
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="h-11 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90"
          >
            {busy ? "Generating..." : "Generate new QR"}
          </Button>
        </div>
      </div>
    </div>
  )
}
