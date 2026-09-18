"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OfficeQrMark } from "./office-qr-mark"

export function KioskView({
  image,
  officeName,
  stationName,
  active,
  onClose,
}: {
  image: string | null
  officeName: string
  stationName: string
  active: boolean
  onClose: () => void
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-nysc-soft px-6 print:hidden">
      <Button
        type="button"
        variant="ghost"
        onClick={onClose}
        className="absolute top-5 right-5 rounded-full text-olive-muted"
      >
        <X data-icon="inline-start" className="size-4" />
        Exit kiosk
      </Button>
      <p className="text-xs font-semibold tracking-[0.2em] text-nysc uppercase">
        National Youth Service Corps
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">{officeName}</h1>
      <p className="mt-1 text-sm text-olive-muted">{stationName}</p>
      <div className="mt-8">
        <OfficeQrMark image={image} officeName={officeName} />
      </div>
      <p className="mt-6 text-base font-semibold text-nysc">
        {active ? "Scan with your registered phone to sign in or out." : "This station is not accepting scans."}
      </p>
    </div>
  )
}
