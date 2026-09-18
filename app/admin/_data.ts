export const weeklyTrend = [
  { label: "Mon (Oct 20)", value: 188 },
  { label: "Tue (Oct 21)", value: 196 },
  { label: "Wed (Oct 22)", value: 182 },
  { label: "Thu (Oct 23)", value: 204 },
  { label: "Fri (Oct 24)", value: 198 },
] as const

export type ActivityStatus =
  | "present"
  | "checked-out"
  | "late"
  | "pending"
  | "approved"
  | "device-reset"

export type ActivityCategory = "attendance" | "approvals"

export type Activity = {
  id: string
  initials: string
  avatar: "green" | "dark" | "rose" | "mint" | "gray"
  name: string
  detail: string
  time: string
  location: string
  status: ActivityStatus
  statusLabel: string
  category: ActivityCategory
}

export const recentActivity: Activity[] = [
  {
    id: "1",
    initials: "OA",
    avatar: "green",
    name: "Oluwaseun Adebayo",
    detail: "ID: NYSC-001 • Biometric Clock-in",
    time: "07:58 AM",
    location: "HQ Abuja (Main Gate)",
    status: "present",
    statusLabel: "Present",
    category: "attendance",
  },
  {
    id: "2",
    initials: "AB",
    avatar: "dark",
    name: "Amina Bello",
    detail: "ID: NYSC-061 • Geofence departure",
    time: "04:12 PM",
    location: "HQ Abuja (Annex)",
    status: "checked-out",
    statusLabel: "Checked Out",
    category: "attendance",
  },
  {
    id: "3",
    initials: "CN",
    avatar: "rose",
    name: "Chidi Nwachukwu",
    detail: "ID: NYSC-042 • QR Scan",
    time: "08:32 AM",
    location: "Zone B Office",
    status: "late",
    statusLabel: "Late (+17m)",
    category: "attendance",
  },
  {
    id: "4",
    initials: "CO",
    avatar: "rose",
    name: "Chinelo Okoro",
    detail: "New Staff Registration • Face ID submitted",
    time: "09:41 AM",
    location: "Lagos State Office",
    status: "pending",
    statusLabel: "Pending Approval",
    category: "approvals",
  },
  {
    id: "5",
    initials: "BY",
    avatar: "mint",
    name: "Babatunde Yusuf",
    detail: "ID: NYSC-219 • Approved by Admin (You)",
    time: "10:15 AM",
    location: "HQ Secretariat",
    status: "approved",
    statusLabel: "Approved",
    category: "approvals",
  },
  {
    id: "6",
    initials: "ED",
    avatar: "gray",
    name: "Emmanuel Danjuma",
    detail: "Trusted device unbound • Security reset",
    time: "11:04 AM",
    location: "Admin Console",
    status: "device-reset",
    statusLabel: "Device Reset",
    category: "approvals",
  },
]
