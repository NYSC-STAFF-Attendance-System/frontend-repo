export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "checked-out"
  | "incomplete"

export type GpsState = "match" | "outside" | "none"

export type AttendanceRecord = {
  id: string
  name: string
  staffId: string
  initials: string
  avatar: "green" | "gray" | "mint" | "photo"
  photo?: string
  department: string
  location: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  gps: GpsState
  gpsDistanceM?: number
}

const departments = [
  "Administration",
  "ICT Directorate",
  "Planning & Statistics",
  "Finance & Accounts",
] as const

const locations = [
  "HQ - Abuja",
  "Zone B - Minna",
  "Zone C - Bauchi",
  "Lagos State Office",
] as const

const extraNames = [
  "Aisha Mohammed",
  "Ifeanyi Obi",
  "Halima Suleiman",
  "Tunde Balogun",
  "Ngozi Eze",
  "Chukwuemeka Okafor",
  "Blessing Adeyemi",
  "Yusuf Lawal",
  "Kemi Adeleke",
  "Samuel Okon",
]

export const featuredAttendance: AttendanceRecord[] = [
  {
    id: "1",
    name: "Oluwaseun Adebayo",
    staffId: "NYS-2023-041",
    initials: "OA",
    avatar: "photo",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&h=96",
    department: "Administration",
    location: "HQ - Abuja",
    date: "Oct 24, 2023",
    checkIn: "07:45 AM",
    checkOut: "05:15 PM",
    status: "present",
    gps: "match",
    gpsDistanceM: 12,
  },
  {
    id: "2",
    name: "Chidinma Nwosu",
    staffId: "NYS-2023-088",
    initials: "CN",
    avatar: "mint",
    department: "ICT Directorate",
    location: "Zone B - Minna",
    date: "Oct 24, 2023",
    checkIn: "08:35 AM",
    checkOut: "05:15 PM",
    status: "late",
    gps: "match",
  },
  {
    id: "3",
    name: "Amina Bello",
    staffId: "NYS-2021-008",
    initials: "AB",
    avatar: "photo",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=96&h=96",
    department: "Planning & Statistics",
    location: "HQ - Abuja",
    date: "Oct 24, 2023",
    checkIn: null,
    checkOut: null,
    status: "absent",
    gps: "none",
  },
  {
    id: "4",
    name: "Babatunde Yusuf",
    staffId: "NYS-2024-112",
    initials: "BY",
    avatar: "gray",
    department: "Finance & Accounts",
    location: "HQ - Abuja",
    date: "Oct 24, 2023",
    checkIn: "07:55 AM",
    checkOut: "04:30 PM",
    status: "checked-out",
    gps: "none",
  },
  {
    id: "5",
    name: "Emmanuel Tobi",
    staffId: "NYS-2020-554",
    initials: "ET",
    avatar: "gray",
    department: "Administration",
    location: "Zone C - Bauchi",
    date: "Oct 24, 2023",
    checkIn: "08:05 AM",
    checkOut: null,
    status: "incomplete",
    gps: "outside",
    gpsDistanceM: 180,
  },
]

const statuses: AttendanceStatus[] = [
  "present",
  "late",
  "absent",
  "checked-out",
  "incomplete",
]

const dates = [
  "Oct 24, 2023",
  "Oct 23, 2023",
  "Oct 22, 2023",
  "Oct 21, 2023",
  "Oct 20, 2023",
  "Oct 19, 2023",
  "Oct 18, 2023",
]

function generatedRecords(): AttendanceRecord[] {
  return Array.from({ length: 249 }, (_, index) => {
    const name = extraNames[index % extraNames.length]
    const [first, last] = name.split(" ")
    const status = statuses[index % statuses.length]
    const outside = index % 11 === 0

    return {
      id: String(index + 6),
      name,
      staffId: `NYS-2023-${String(120 + index).padStart(3, "0")}`,
      initials: `${first[0]}${last[0]}`,
      avatar: index % 3 === 0 ? "green" : index % 3 === 1 ? "mint" : "gray",
      department: departments[index % departments.length],
      location: locations[index % locations.length],
      date: dates[index % dates.length],
      checkIn:
        status === "absent" ? null : index % 2 === 0 ? "07:48 AM" : "08:22 AM",
      checkOut:
        status === "checked-out" || status === "late" ? "04:45 PM" : null,
      status,
      gps: outside ? "outside" : status === "absent" ? "none" : "match",
      gpsDistanceM: outside ? 80 + (index % 120) : undefined,
    }
  })
}

export const attendanceRecords: AttendanceRecord[] = [
  ...featuredAttendance,
  ...generatedRecords(),
]

export function getAttendanceById(id: string) {
  return attendanceRecords.find((record) => record.id === id)
}

const officeStations: Record<
  string,
  { lat: number; lon: number; station: string; qr: string }
> = {
  "HQ - Abuja": {
    lat: 9.05785,
    lon: 7.49508,
    station: "NYSC Directorate HQ, Maitama, Abuja FCT",
    qr: "NYSC-HQ-ABJ-GATE1",
  },
  "Zone B - Minna": {
    lat: 9.61333,
    lon: 6.55694,
    station: "NYSC Zone B Secretariat, Minna, Niger State",
    qr: "NYSC-ZN-B-GATE1",
  },
  "Zone C - Bauchi": {
    lat: 10.31028,
    lon: 9.84389,
    station: "NYSC Zone C Secretariat, Bauchi",
    qr: "NYSC-ZN-C-GATE1",
  },
  "Lagos State Office": {
    lat: 6.45407,
    lon: 3.39467,
    station: "NYSC Lagos State Office, Ikoyi, Lagos",
    qr: "NYSC-LAG-GATE1",
  },
}

const devices = [
  "Apple iPhone 15 Pro • Safari Mobile",
  "Samsung Galaxy S24 • Chrome Mobile",
  "Tecno Camon 30 • Chrome Mobile",
  "Apple iPhone 13 • Safari Mobile",
]

export type VerificationFlag = {
  ok: boolean
  title: string
  status: string
  hint: string
}

export type AttendanceDetail = {
  duration: string
  mapUrl: string
  station: string
  qr: string
  permittedRadiusM: number
  distanceM: number | null
  accuracy: string
  gpsVerified: boolean
  gpsStatusLabel: string
  gpsHeadline: string
  device: string
  bindingStatus: string
  serverTimestamp: string
  auditValid: boolean
  flags: {
    trustedDevice: VerificationFlag
    officeQr: VerificationFlag
    gpsPerimeter: VerificationFlag
  }
}

export function clockToMinutes(value: string | null) {
  if (!value) return null
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const mer = match[3].toUpperCase()
  return (hours % 12) * 60 + minutes + (mer === "PM" ? 12 * 60 : 0)
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

function parseRecordDate(date: string) {
  const match = date.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/)
  if (!match) return null
  const month = MONTHS.indexOf(match[1] as (typeof MONTHS)[number])
  if (month < 0) return null
  return { year: Number(match[3]), month, day: Number(match[2]) }
}

function dateStamp(date: string) {
  const parsed = parseRecordDate(date)
  if (!parsed) return "20231024"
  return `${parsed.year}${String(parsed.month + 1).padStart(2, "0")}${String(parsed.day).padStart(2, "0")}`
}

function formatFullDate(date: string) {
  const parsed = parseRecordDate(date)
  if (!parsed) return date
  const weekday = new Date(Date.UTC(parsed.year, parsed.month, parsed.day)).getUTCDay()
  return `${WEEKDAYS[weekday]}, ${MONTH_NAMES[parsed.month]} ${parsed.day}, ${parsed.year}`
}

function durationLabel(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return "—"
  const start = clockToMinutes(checkIn)
  const end = clockToMinutes(checkOut)
  if (start == null || end == null) return "—"
  const mins = end - start
  if (mins <= 0) return "—"
  const hours = Math.floor(mins / 60)
  const remainder = mins % 60
  return `${hours}h ${String(remainder).padStart(2, "0")}m`
}

function withSeconds(checkIn: string) {
  const [clock, mer] = checkIn.split(" ")
  return `${clock}:12 ${mer} WAT (Signed by Server)`
}

export function getAttendanceDetail(record: AttendanceRecord): AttendanceDetail {
  const office = officeStations[record.location] ?? officeStations["HQ - Abuja"]
  const zoom = record.location === "HQ - Abuja" ? 12 : 14
  const mapUrl = `https://www.google.com/maps?q=${office.lat},${office.lon}&hl=en&z=${zoom}&output=embed`
  const gpsVerified = record.gps === "match"
  const distanceM =
    record.gps === "none" ? null : (record.gpsDistanceM ?? (gpsVerified ? 12 : 80))
  const hasSession = record.status !== "absent" && record.checkIn !== null

  return {
    duration: durationLabel(record.checkIn, record.checkOut),
    mapUrl,
    station: office.station,
    qr: office.qr,
    permittedRadiusM: 50,
    distanceM,
    accuracy:
      record.gps === "match"
        ? "±4m (High Precision)"
        : record.gps === "outside"
          ? "±18m (Low Confidence)"
          : "Unavailable",
    gpsVerified,
    gpsStatusLabel:
      record.gps === "match"
        ? "Verified"
        : record.gps === "outside"
          ? "Failed"
          : "No Signal",
    gpsHeadline:
      record.gps === "match"
        ? "Within Permitted Radius"
        : record.gps === "outside"
          ? "Outside Permitted Radius"
          : "GPS Not Captured",
    device: devices[(Number(record.id) - 1) % devices.length],
    bindingStatus: hasSession
      ? record.gps === "outside"
        ? "Location Flagged For Review"
        : "Trusted Device Session Validated"
      : "No Device Session Bound",
    serverTimestamp: record.checkIn ? withSeconds(record.checkIn) : "Not recorded",
    auditValid: gpsVerified && hasSession,
    flags: {
      trustedDevice: {
        ok: hasSession && record.gps !== "outside",
        title: "Trusted Device",
        status: hasSession && record.gps !== "outside" ? "Verified" : "Unverified",
        hint: hasSession ? "Binding token active" : "No token bound",
      },
      officeQr: {
        ok: hasSession,
        title: "Office QR",
        status: hasSession ? "Verified" : "Missing",
        hint: hasSession ? "Checkpoint token valid" : "No scan recorded",
      },
      gpsPerimeter: {
        ok: gpsVerified,
        title: "GPS Perimeter",
        status:
          record.gps === "match"
            ? "Within 50m"
            : record.gps === "outside"
              ? "Outside 50m"
              : "No GPS",
        hint:
          record.gps === "match"
            ? "Radius test passed"
            : record.gps === "outside"
              ? "Radius test failed"
              : "No fix received",
      },
    },
  }
}

export const CHECK_IN_CUTOFF = "08:15 AM"
export const STANDARD_CHECK_IN = "08:00 AM"
export const STANDARD_CHECK_OUT = "04:15 PM"

export const DEFAULT_CORRECTION_REASON =
  "Officer was deployed for early morning server room power cut emergency in ICT wing starting at 07:45 AM per State Coordinator directive. Physical QR check-in was delayed until systems restored."

export type CorrectionMeta = {
  recordCode: string
  fullDate: string
  officeLabel: string
  minutesLate: number
  isLate: boolean
  cutoff: string
  lat: number
  lon: number
  distanceM: number
  centroid: string
  authenticator: string
  terminal: string
  sessionId: string
  hash: string
  proposedCheckIn: string
  proposedCheckOut: string
}

export function getCorrectionMeta(record: AttendanceRecord): CorrectionMeta {
  const office = officeStations[record.location] ?? officeStations["HQ - Abuja"]
  const detail = getAttendanceDetail(record)
  const checkInMins = clockToMinutes(record.checkIn)
  const cutoffMins = clockToMinutes(CHECK_IN_CUTOFF) ?? 8 * 60 + 15
  const minutesLate =
    checkInMins == null ? 0 : Math.max(0, checkInMins - cutoffMins)
  const isLate = minutesLate > 0 || record.status === "late"
  const digits = record.staffId.replace(/\D/g, "").slice(-3).padStart(3, "0")
  const stamp = dateStamp(record.date)
  const authenticator = detail.device
    .split("•")[0]
    .trim()
    .replace(/^Apple\s+/, "")

  return {
    recordCode: `ATT-${stamp}-${digits}`,
    fullDate: formatFullDate(record.date),
    officeLabel:
      record.location === "HQ - Abuja"
        ? "HQ - Abuja Secretariat (Maitama Centroid)"
        : office.station,
    minutesLate,
    isLate,
    cutoff: CHECK_IN_CUTOFF,
    lat: office.lat,
    lon: office.lon,
    distanceM: record.gpsDistanceM ?? 14,
    centroid:
      record.location === "HQ - Abuja" ? "Maitama HQ Centroid" : office.station,
    authenticator,
    terminal:
      record.location === "HQ - Abuja" ? "Maitama Main Wing" : office.qr,
    sessionId: `S${String(8940 + (Number(record.id) % 50)).padStart(4, "0")}`,
    hash: `SHA256: ${(7919 * Number(record.id || 1)).toString(16).slice(0, 4)}…b039`,
    proposedCheckIn:
      isLate || !record.checkIn ? STANDARD_CHECK_IN : record.checkIn,
    proposedCheckOut: record.checkOut ?? STANDARD_CHECK_OUT,
  }
}

export const reportTypes = [
  "All Records (Standard)",
  "Daily Summary",
  "Exception Report",
] as const

export const dateRanges = [
  "Last 7 Days",
  "Today",
  "Last 30 Days",
  "This Month",
] as const

export const departmentOptions = ["All Departments", ...departments] as const
export const locationOptions = ["All Locations", ...locations] as const
export const statusOptions = [
  "All Statuses",
  "Present",
  "Late",
  "Absent",
  "Checked Out",
  "Incomplete",
] as const
