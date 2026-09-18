export const reportPeriods = [
  "Today",
  "This Week",
  "This Month",
  "Q4 2023",
] as const

export type ReportPeriod = (typeof reportPeriods)[number]

export const periodRange: Record<ReportPeriod, string> = {
  Today: "Oct 24, 2023",
  "This Week": "Oct 20 – 24, 2023",
  "This Month": "Oct 1 – 31, 2023",
  "Q4 2023": "Oct 1 – Dec 31, 2023",
}

export const reportKpis = [
  {
    id: "punctuality",
    label: "Punctuality",
    value: "91.8%",
    delta: "+2.4%",
    tone: "up" as const,
  },
  {
    id: "late",
    label: "Late",
    value: "1,420",
    delta: "−12%",
    tone: "up" as const,
  },
  {
    id: "absent",
    label: "Absent",
    value: "670",
    delta: "412 / 258",
    tone: "warn" as const,
  },
  {
    id: "overrides",
    label: "Overrides",
    value: "86",
    delta: "100%",
    tone: "neutral" as const,
  },
] as const

export const punctualityTrend = [
  { label: "Oct 5", value: 88.4 },
  { label: "Oct 8", value: 90.1 },
  { label: "Oct 12", value: 92.6 },
  { label: "Oct 16", value: 97.4 },
  { label: "Oct 19", value: 98.2 },
  { label: "Oct 22", value: 94.1 },
  { label: "Oct 26", value: 92.0 },
  { label: "Oct 31", value: 91.8 },
] as const

export const trendStats = [
  { label: "Midweek", value: "94.6%" },
  { label: "Peak", value: "98.2%" },
  { label: "Drop", value: "−3.8%", tone: "down" as const },
] as const

export const directorates = [
  { name: "ICT & Biometrics", staff: 48, score: 98.4, flag: null },
  { name: "Corps Mobilization", staff: 112, score: 94.2, flag: null },
  { name: "Community Development", staff: 86, score: 91.5, flag: null },
  { name: "General Services", staff: 64, score: 88.7, flag: "notice" as const },
  { name: "Zonal Inspectorate", staff: 72, score: 85.1, flag: "review" as const },
] as const

export type ScoreBand =
  | "Perfect"
  | "Exemplary"
  | "High"
  | "Benchmark"
  | "Compliant"
  | "Deficient"

export type ReportStaffRow = {
  id: string
  name: string
  staffId: string
  initials: string
  station: string
  present: number
  expected: number
  score: number
  band: ScoreBand
  avgIn: string
  late: boolean
}

export const featuredReportStaff: ReportStaffRow[] = [
  {
    id: "1",
    name: "Babatunde Yusuf",
    staffId: "STF/ABJ/090",
    initials: "BY",
    station: "HQ Secretariat",
    present: 22,
    expected: 22,
    score: 98.5,
    band: "Exemplary",
    avgIn: "07:44",
    late: false,
  },
  {
    id: "2",
    name: "Fatimah Ahmed",
    staffId: "STF/KN/012",
    initials: "FA",
    station: "Kuloma Camp",
    present: 22,
    expected: 22,
    score: 95.4,
    band: "High",
    avgIn: "07:50",
    late: false,
  },
  {
    id: "3",
    name: "Chinedu Okonkwo",
    staffId: "STF/ABJ/030",
    initials: "CO",
    station: "Garki Office",
    present: 21,
    expected: 22,
    score: 90.9,
    band: "Benchmark",
    avgIn: "08:08",
    late: false,
  },
  {
    id: "4",
    name: "Amina Bello",
    staffId: "STF/BO/044",
    initials: "AB",
    station: "Gwange Outpost",
    present: 17,
    expected: 22,
    score: 73.2,
    band: "Deficient",
    avgIn: "08:42",
    late: true,
  },
  {
    id: "5",
    name: "Emeka Eze",
    staffId: "STF/ABJ/001",
    initials: "EE",
    station: "HQ Secretariat",
    present: 22,
    expected: 22,
    score: 92.5,
    band: "Compliant",
    avgIn: "08:12",
    late: true,
  },
  {
    id: "6",
    name: "Grace Danjuma",
    staffId: "STF/ABJ/008",
    initials: "GD",
    station: "HQ Chambers",
    present: 22,
    expected: 22,
    score: 100,
    band: "Perfect",
    avgIn: "07:31",
    late: false,
  },
]

const extraStaff = [
  { name: "Halima Suleiman", id: "STF/ABJ/120", initials: "HS", station: "Zone B" },
  { name: "Ifeanyi Obi", id: "STF/ABJ/121", initials: "IO", station: "Annex" },
  { name: "Ngozi Eze", id: "STF/ABJ/124", initials: "NE", station: "Garki Office" },
  { name: "Yusuf Lawal", id: "STF/ABJ/125", initials: "YL", station: "Minna" },
  { name: "Tunde Balogun", id: "STF/ABJ/123", initials: "TB", station: "HQ Secretariat" },
] as const

const bands: ScoreBand[] = [
  "Exemplary",
  "High",
  "Benchmark",
  "Compliant",
  "Deficient",
  "Perfect",
]

function generatedStaff(): ReportStaffRow[] {
  return Array.from({ length: 248 }, (_, index) => {
    const person = extraStaff[index % extraStaff.length]
    const band = bands[index % bands.length]
    const score =
      band === "Perfect"
        ? 100
        : band === "Exemplary"
          ? 98 - (index % 3)
          : band === "High"
            ? 95 - (index % 3)
            : band === "Benchmark"
              ? 90 - (index % 2)
              : band === "Compliant"
                ? 88 - (index % 4)
                : 72 - (index % 8)
    const present = band === "Deficient" ? 17 + (index % 3) : 21 + (index % 2)

    return {
      id: String(index + 7),
      name: person.name,
      staffId: `${person.id.slice(0, -3)}${String(130 + (index % 70)).padStart(3, "0")}`,
      initials: person.initials,
      station: person.station,
      present: Math.min(present, 22),
      expected: 22,
      score,
      band,
      avgIn: band === "Deficient" ? "08:41" : index % 2 === 0 ? "07:52" : "08:06",
      late: band === "Deficient" || band === "Compliant",
    }
  })
}

export const reportStaff: ReportStaffRow[] = [
  ...featuredReportStaff,
  ...generatedStaff(),
]

export const statusFilters = [
  "All statuses",
  "Perfect",
  "Exemplary",
  "High",
  "Benchmark",
  "Compliant",
  "Deficient",
] as const

export const stationFilters = [
  "All stations",
  "HQ Secretariat",
  "HQ Chambers",
  "Garki Office",
  "Kuloma Camp",
  "Gwange Outpost",
  "Zone B",
  "Annex",
  "Minna",
] as const

export const ANOMALY_COUNT = 14
