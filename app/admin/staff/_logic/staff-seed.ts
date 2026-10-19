import type { SeedStaffInput } from "@/types";

export const STAFF_RANKS = [
  ["director", "Director"],
  ["deputy_director", "Deputy Director"],
  ["assistant_director", "Assistant Director"],
  ["chief", "Chief"],
  ["assistant_chief", "Assistant Chief"],
  ["principal", "Principal"],
  ["senior", "Senior"],
  ["officer", "Officer"],
  ["assistant", "Assistant"],
  ["corps_member", "Corps Member"],
] as const;

export const STAFF_DEPARTMENTS = [
  ["administration", "Administration"],
  ["finance", "Finance"],
  ["ict", "ICT"],
  ["corps_welfare", "Corps Welfare"],
  ["skills_acquisition", "Skills Acquisition"],
  ["community_development", "Community Development"],
  ["legal", "Legal"],
  ["public_relations", "Public Relations"],
  ["inspection", "Inspection"],
  ["stores", "Stores"],
  ["certification", "Certification"],
] as const;

const RANK_VALUES = new Set<string>(STAFF_RANKS.map(([value]) => value));
const DEPARTMENT_VALUES = new Set<string>(STAFF_DEPARTMENTS.map(([value]) => value));
const OFFICE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ROWS = 200;

export type StaffSeedDraft = {
  row: number;
  staffId: string;
  surname: string;
  firstName: string;
  middleName: string;
  rank: string;
  department: string;
  officeId: string;
};

export type StaffSeedIssue = {
  row: number;
  message: string;
};

export type ParsedStaffCsv = {
  rows: StaffSeedDraft[];
  issues: StaffSeedIssue[];
};

const HEADER_ALIASES: Record<string, keyof Omit<StaffSeedDraft, "row">> = {
  staff_id: "staffId",
  staffid: "staffId",
  staff: "staffId",
  surname: "surname",
  last_name: "surname",
  lastname: "surname",
  first_name: "firstName",
  firstname: "firstName",
  middlename: "middleName",
  middle_name: "middleName",
  rank: "rank",
  department: "department",
  office_id: "officeId",
  officeid: "officeId",
  office: "officeId",
};

export function staffSeedTemplate() {
  return [
    "staff_id,surname,first_name,rank,department,office_id",
    "LG0001,Adeyemi,Tunde,officer,administration,11111111-1111-1111-1111-111111111111",
  ].join("\n");
}

export function parseStaffCsv(text: string): ParsedStaffCsv {
  const table = parseCsv(text);
  if (table.length === 0) {
    return { rows: [], issues: [{ row: 1, message: "The file is empty." }] };
  }

  const header = table[0].map((cell) => cell.trim().toLowerCase().replace(/[\s-]+/g, "_"));
  const columns = header.map((name) => HEADER_ALIASES[name] ?? null);
  if (!columns.includes("staffId")) {
    return { rows: [], issues: [{ row: 1, message: "Add a staff_id column." }] };
  }
  for (const required of ["surname", "firstName", "rank"] as const) {
    if (!columns.includes(required)) {
      const label = required === "firstName" ? "first_name" : required;
      return { rows: [], issues: [{ row: 1, message: `Add a ${label} column.` }] };
    }
  }

  const body = table.slice(1);
  if (body.length > MAX_ROWS) {
    return {
      rows: [],
      issues: [{ row: 1, message: `This file has ${body.length} rows. Split it into files of ${MAX_ROWS} or fewer.` }],
    };
  }

  const rows: StaffSeedDraft[] = [];
  const issues: StaffSeedIssue[] = [];
  const seen = new Map<string, number>();

  body.forEach((cells, index) => {
    const row = index + 2;
    const draft: StaffSeedDraft = {
      row,
      staffId: "",
      surname: "",
      firstName: "",
      middleName: "",
      rank: "",
      department: "",
      officeId: "",
    };
    columns.forEach((key, column) => {
      if (!key) return;
      draft[key] = (cells[column] ?? "").trim();
    });
    if (!draft.staffId && !draft.surname && !draft.firstName && !draft.rank) return;

    draft.staffId = draft.staffId.replace(/\s+/g, "");
    draft.rank = slug(draft.rank);
    draft.department = slug(draft.department);

    const problems = problemsFor(draft);
    const earlier = seen.get(draft.staffId);
    if (draft.staffId && earlier) {
      problems.push(`Staff ID ${draft.staffId} is also on row ${earlier}.`);
    } else if (draft.staffId) {
      seen.set(draft.staffId, row);
    }
    problems.forEach((message) => issues.push({ row, message }));
    rows.push(draft);
  });

  if (rows.length === 0 && issues.length === 0) {
    issues.push({ row: 1, message: "The file has a header but no staff rows." });
  }

  return { rows, issues };
}

/** Fills a blank office from the superuser's choice, then checks that choice. */
export function prepareSeedRows(
  parsed: ParsedStaffCsv,
  options: { isSuperAdmin: boolean; officeId: string },
): { rows: SeedStaffInput[]; issues: StaffSeedIssue[] } {
  const issues = [...parsed.issues];
  const rows: SeedStaffInput[] = [];

  for (const draft of parsed.rows) {
    const officeId = options.isSuperAdmin ? draft.officeId || options.officeId : "";
    if (options.isSuperAdmin && !officeId) {
      issues.push({ row: draft.row, message: "Choose an office, or put office_id on this row." });
    } else if (officeId && !OFFICE_ID.test(officeId)) {
      issues.push({ row: draft.row, message: "office_id must be the office's id." });
    }
    rows.push({
      staffId: draft.staffId,
      surname: draft.surname,
      firstName: draft.firstName,
      middleName: draft.middleName || undefined,
      rank: draft.rank,
      department: draft.department || undefined,
      officeId: officeId || undefined,
    });
  }

  return { rows, issues };
}

function problemsFor(draft: StaffSeedDraft) {
  const problems: string[] = [];
  if (!draft.staffId) problems.push("Staff ID is required.");
  else if (draft.staffId.length > 6) problems.push("Staff ID must be 6 characters or fewer.");
  if (!draft.surname) problems.push("Surname is required.");
  if (!draft.firstName) problems.push("First name is required.");
  if (!draft.rank) problems.push("Rank is required.");
  else if (!RANK_VALUES.has(draft.rank)) problems.push(`Rank "${draft.rank}" is not recognised.`);
  if (draft.department && !DEPARTMENT_VALUES.has(draft.department)) {
    problems.push(`Department "${draft.department}" is not recognised.`);
  }
  return problems;
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, "");
  const table: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) table.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) table.push(row);
  return table;
}
