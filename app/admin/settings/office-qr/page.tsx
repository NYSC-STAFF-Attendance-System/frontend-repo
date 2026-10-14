import type { Metadata } from "next"

import { OfficeQrPanel } from "./_components/office-qr-panel"

export const metadata: Metadata = {
  title: "Office QR Code | NYSC Portal",
  description: "Generate and print the station QR code staff scan for attendance.",
}

export default function OfficeQrPage() {
  return <OfficeQrPanel />
}
