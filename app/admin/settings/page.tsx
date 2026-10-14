import type { Metadata } from "next"

import { SettingsPanel } from "./_components/settings-panel"

export const metadata: Metadata = {
  title: "Settings | NYSC Portal",
  description: "Configure attendance hours, validation rules, and office settings.",
}

export default function SettingsPage() {
  return <SettingsPanel />
}
