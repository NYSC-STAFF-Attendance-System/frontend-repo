export type AuditRole = "Administrator" | "Staff" | "System"

export type AuditModule = "Attendance" | "Staff" | "Settings"

export type AuditAction =
  | "Attendance Corrected"
  | "Staff Checked In"
  | "Staff Checked Out"
  | "Registration Approved"
  | "Attendance Settings Changed"
  | "Staff Account Created"

export type AuditEvent = {
  id: string
  date: string
  time: string
  user: string
  userId: string
  initials: string
  role: AuditRole
  action: AuditAction
  module: AuditModule
  recordCode: string
  recordDetail: string
}

const extraUsers = [
  { name: "Aisha Mohammed", id: "NYSC/STF/120", initials: "AM" },
  { name: "Ifeanyi Obi", id: "NYSC/STF/121", initials: "IO" },
  { name: "Halima Suleiman", id: "NYSC/STF/122", initials: "HS" },
  { name: "Tunde Balogun", id: "NYSC/STF/123", initials: "TB" },
  { name: "Ngozi Eze", id: "NYSC/STF/124", initials: "NE" },
  { name: "Yusuf Lawal", id: "NYSC/STF/125", initials: "YL" },
] as const

export const featuredAuditEvents: AuditEvent[] = [
  {
    id: "1",
    date: "Oct 24, 2023",
    time: "09:16 AM WAT",
    user: "Ibrahim Bello",
    userId: "STF/ABJ/COORD-01",
    initials: "IB",
    role: "Administrator",
    action: "Attendance Corrected",
    module: "Attendance",
    recordCode: "ATT-20231024-089",
    recordDetail: "Babatunde Yusuf",
  },
  {
    id: "2",
    date: "Oct 24, 2023",
    time: "08:34 AM WAT",
    user: "Babatunde Yusuf",
    userId: "NYSC/STF/089",
    initials: "BY",
    role: "Staff",
    action: "Staff Checked In",
    module: "Attendance",
    recordCode: "ATT-20231024-089",
    recordDetail: "HQ - Abuja (Late)",
  },
  {
    id: "3",
    date: "Oct 24, 2023",
    time: "08:22 AM WAT",
    user: "Ibrahim Bello",
    userId: "STF/ABJ/COORD-01",
    initials: "IB",
    role: "Administrator",
    action: "Registration Approved",
    module: "Staff",
    recordCode: "REG-2023-118",
    recordDetail: "Chidi Nwachi",
  },
  {
    id: "4",
    date: "Oct 24, 2023",
    time: "08:15 AM WAT",
    user: "System",
    userId: "CRON/AUTOSHIFT",
    initials: "SY",
    role: "System",
    action: "Attendance Settings Changed",
    module: "Settings",
    recordCode: "CFG-SHIFT",
    recordDetail: "Grace period locked",
  },
  {
    id: "5",
    date: "Oct 24, 2023",
    time: "08:02 AM WAT",
    user: "Fatimah Ahmed",
    userId: "NYSC/STF/112",
    initials: "FA",
    role: "Staff",
    action: "Staff Checked In",
    module: "Attendance",
    recordCode: "ATT-20231024-112",
    recordDetail: "Zone B - Minna",
  },
  {
    id: "6",
    date: "Oct 24, 2023",
    time: "07:55 AM WAT",
    user: "Ibrahim Bello",
    userId: "STF/ABJ/COORD-01",
    initials: "IB",
    role: "Administrator",
    action: "Staff Account Created",
    module: "Staff",
    recordCode: "REG-2023-042",
    recordDetail: "Chinelo Okoro",
  },
  {
    id: "7",
    date: "Oct 24, 2023",
    time: "07:52 AM WAT",
    user: "Chinelo Okoro",
    userId: "NYSC/STF/042",
    initials: "CO",
    role: "Staff",
    action: "Staff Checked In",
    module: "Attendance",
    recordCode: "ATT-20231024-042",
    recordDetail: "HQ - Abuja (On-time)",
  },
]

const generatedActions: AuditAction[] = [
  "Staff Checked In",
  "Staff Checked Out",
  "Staff Checked In",
  "Attendance Corrected",
  "Registration Approved",
  "Attendance Settings Changed",
  "Staff Account Created",
]

function clockLabel(index: number) {
  const minutes = 7 * 60 + 40 - (index % 180)
  const wrapped = ((minutes % (12 * 60)) + 12 * 60) % (12 * 60)
  const hours = Math.floor(wrapped / 60) || 12
  const mins = wrapped % 60
  const mer = index % 5 === 0 ? "PM" : "AM"
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${mer} WAT`
}

function generatedEvents(): AuditEvent[] {
  return Array.from({ length: 475 }, (_, index) => {
    const person = extraUsers[index % extraUsers.length]
    const action = generatedActions[index % generatedActions.length]
    const eventModule: AuditModule =
      action === "Attendance Settings Changed"
        ? "Settings"
        : action === "Registration Approved" || action === "Staff Account Created"
          ? "Staff"
          : "Attendance"
    const role: AuditRole =
      action === "Attendance Settings Changed"
        ? "System"
        : action === "Attendance Corrected" ||
            action === "Registration Approved" ||
            action === "Staff Account Created"
          ? "Administrator"
          : "Staff"

    return {
      id: String(index + 8),
      date: "Oct 24, 2023",
      time: clockLabel(index),
      user: role === "Administrator" ? "Ibrahim Bello" : role === "System" ? "System" : person.name,
      userId:
        role === "Administrator"
          ? "STF/ABJ/COORD-01"
          : role === "System"
            ? "CRON/AUTOSHIFT"
            : person.id,
      initials:
        role === "Administrator" ? "IB" : role === "System" ? "SY" : person.initials,
      role,
      action,
      module: eventModule,
      recordCode:
        eventModule === "Attendance"
          ? `ATT-20231024-${String(130 + (index % 80)).padStart(3, "0")}`
          : eventModule === "Staff"
            ? `REG-2023-${String(200 + (index % 40)).padStart(3, "0")}`
            : "CFG-SHIFT",
      recordDetail:
        eventModule === "Settings"
          ? "Grace period updated"
          : person.name,
    }
  })
}

export const auditEvents: AuditEvent[] = [
  ...featuredAuditEvents,
  ...generatedEvents(),
]

export const dateOptions = ["Today", "Last 7 Days", "Last 30 Days"] as const
export const moduleOptions = ["All Modules", "Attendance", "Staff", "Settings"] as const
export const actionOptions = [
  "All Actions",
  "Staff Checked In",
  "Staff Checked Out",
  "Attendance Corrected",
  "Registration Approved",
  "Attendance Settings Changed",
  "Staff Account Created",
] as const
export const roleOptions = ["All Roles", "Administrator", "Staff", "System"] as const

export type AuditAttachment = {
  name: string
  size: string
  note: string
}

export type AuditEventDetail = AuditEvent & {
  auditCode: string
  actorBadge: string
  actorTitle: string
  ip: string
  portal: string
  policy: string
  privileged: boolean
  affectedName: string
  affectedMeta: string
  affectedInitials: string
  previousValue: string | null
  newValue: string | null
  reason: string | null
  authorizedBy: string | null
  attachment: AuditAttachment | null
  hash: string
}

const FEATURED_HASH =
  "e3b8c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

function auditCodeFor(event: AuditEvent) {
  const digits = event.recordCode.replace(/\D/g, "").slice(-3).padStart(3, "0")
  const suffix = digits.slice(-2)
  return `A${suffix}-20231024-8${suffix}`
}

function mockHash(id: string) {
  const pad = id.padStart(4, "0")
  return `e3b8c44298fc1c149afbf4c8996fb92427ae41e4649b934ca49599${pad}b855`
}

export function getAuditEventDetail(event: AuditEvent): AuditEventDetail {
  const privileged =
    event.action === "Attendance Corrected" ||
    event.action === "Attendance Settings Changed"

  const base: AuditEventDetail = {
    ...event,
    auditCode: auditCodeFor(event),
    actorBadge:
      event.role === "Administrator"
        ? "State Coordinator / Admin"
        : event.role === "System"
          ? "System"
          : "Staff",
    actorTitle:
      event.role === "Administrator"
        ? "State Coordinator (Abuja Directorate)"
        : event.role === "System"
          ? "Automated shift controller"
          : "Field staff",
    ip: event.role === "System" ? "10.12.4.8" : "197.210.64.12",
    portal:
      event.role === "System" ? "Internal daemon" : "Chrome 118 (macOS)",
    policy:
      event.module === "Attendance"
        ? "Attendance — Administrative Override Policy §14.2"
        : event.module === "Staff"
          ? "Staff — Registration & Identity Policy §8.1"
          : "Settings — Operational Control Policy §3.4",
    privileged,
    affectedName: event.recordDetail,
    affectedMeta:
      event.module === "Attendance"
        ? `HQ Central Secretariat • ${event.recordDetail === "Babatunde Yusuf" ? "NYSC/STF/089" : event.userId}`
        : event.module === "Staff"
          ? "Staff directory"
          : "System configuration",
    affectedInitials:
      event.recordDetail === "Babatunde Yusuf"
        ? "BY"
        : event.recordDetail.slice(0, 2).toUpperCase(),
    previousValue: null,
    newValue: null,
    reason: null,
    authorizedBy: null,
    attachment: null,
    hash: mockHash(event.id),
  }

  if (event.id === "1") {
    return {
      ...base,
      auditCode: "A89-20231024-889",
      affectedName: "Babatunde Yusuf",
      affectedMeta: "HQ Central Secretariat • NYSC/STF/089",
      affectedInitials: "BY",
      previousValue: "Late (08:34 AM WAT, +34s)",
      newValue: "Present / Excused (Approved official duty delay)",
      reason:
        "Official verification letter submitted by Zonal inspector. Transport breakdown on highway during transit.",
      authorizedBy: "Ibrahim Bello (State Coordinator / Admin)",
      attachment: {
        name: "Zonal_Inspector_Endorsement_089.pdf",
        size: "1.4 MB",
        note: "Digitally Signed Cryptographic Doc",
      },
      hash: FEATURED_HASH,
    }
  }

  if (event.action === "Attendance Corrected") {
    return {
      ...base,
      previousValue: "Late (08:34 AM WAT)",
      newValue: "Present / Excused",
      reason: "Manual override recorded by an administrator.",
      authorizedBy: `${event.user} (${base.actorBadge})`,
    }
  }

  if (event.action === "Staff Checked In") {
    return {
      ...base,
      previousValue: "Not checked in",
      newValue: event.recordDetail.includes("Late") ? "Late" : "Present",
    }
  }

  if (event.action === "Staff Checked Out") {
    return {
      ...base,
      previousValue: "On duty",
      newValue: "Checked out",
    }
  }

  if (event.action === "Registration Approved") {
    return {
      ...base,
      previousValue: "Pending approval",
      newValue: "Approved",
      authorizedBy: `${event.user} (${base.actorBadge})`,
    }
  }

  if (event.action === "Staff Account Created") {
    return {
      ...base,
      previousValue: "No account",
      newValue: "Staff account created",
      authorizedBy: `${event.user} (${base.actorBadge})`,
    }
  }

  return {
    ...base,
    previousValue: "Previous configuration",
    newValue: event.recordDetail,
    authorizedBy: `${event.user} (${base.actorBadge})`,
  }
}

