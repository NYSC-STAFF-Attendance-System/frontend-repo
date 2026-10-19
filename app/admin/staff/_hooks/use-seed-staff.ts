"use client";

import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "@/components/snackbar";
import { useStaff } from "@/hooks/use-staff";
import { api } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { adminFailureNotice } from "@/lib/messages";
import type { AdminOffice } from "@/types";
import {
  parseStaffCsv,
  prepareSeedRows,
  staffSeedTemplate,
  type ParsedStaffCsv,
  type StaffSeedIssue,
} from "../_logic/staff-seed";

const EMPTY: ParsedStaffCsv = { rows: [], issues: [] };

export function useSeedStaff(onSeeded: () => void) {
  const staff = useStaff();
  const isSuperAdmin = staff.role === "super_admin";
  const snackbar = useSnackbar();
  const [offices, setOffices] = useState<AdminOffice[]>([]);
  const [officeId, setOfficeId] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedStaffCsv>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failures, setFailures] = useState<StaffSeedIssue[]>([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let active = true;
    api.admin.listOffices().then((result) => {
      if (!active) return;
      if (result.kind !== "success") return;
      setOffices(result.offices);
      setOfficeId((current) => current || result.offices[0]?.id || "");
    });
    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  const prepared = useMemo(
    () => prepareSeedRows(parsed, { isSuperAdmin, officeId }),
    [isSuperAdmin, officeId, parsed],
  );

  const issues = prepared.issues;
  const ready = prepared.rows.length > 0 && issues.length === 0 && !submitting;

  async function chooseFile(file: File) {
    const text = await file.text();
    setFileName(file.name);
    setParsed(parseStaffCsv(text));
    setFailures([]);
    setProgress(null);
  }

  function clearFile() {
    setFileName("");
    setParsed(EMPTY);
    setFailures([]);
    setProgress(null);
  }

  function downloadTemplate() {
    downloadCsv("staff-seed-template.csv", staffSeedTemplate());
  }

  async function upload() {
    if (!ready) return;
    const batch = prepared.rows;
    setSubmitting(true);
    setFailures([]);
    setProgress({ done: 0, total: batch.length });

    const rejected: StaffSeedIssue[] = [];
    let created = 0;
    for (let index = 0; index < batch.length; index += 1) {
      const row = batch[index];
      const result = await api.admin.seedStaff(row);
      if (result.kind === "created") {
        created += 1;
      } else if (result.kind === "offline" || result.kind === "forbidden") {
        const notice = adminFailureNotice(result);
        rejected.push({
          row: parsed.rows[index]?.row ?? index + 2,
          message: notice.description ? `${notice.title} ${notice.description}` : notice.title,
        });
        setProgress({ done: index + 1, total: batch.length });
        break;
      } else {
        rejected.push({
          row: parsed.rows[index]?.row ?? index + 2,
          message: `${row.staffId}: ${result.message}`,
        });
      }
      setProgress({ done: index + 1, total: batch.length });
    }

    setSubmitting(false);
    setFailures(rejected);
    if (created > 0) {
      onSeeded();
      snackbar({
        tone: rejected.length > 0 ? "info" : "success",
        title:
          rejected.length > 0
            ? `Seeded ${created} of ${batch.length} staff.`
            : created === 1
              ? "Seeded 1 staff member."
              : `Seeded ${created} staff.`,
      });
      if (rejected.length === 0) clearFile();
      return;
    }
    snackbar({
      tone: "error",
      title: "No staff were seeded.",
      description: rejected[0]?.message,
    });
  }

  return {
    isSuperAdmin,
    offices,
    officeId,
    setOfficeId,
    fileName,
    preview: prepared.rows.slice(0, 5),
    total: prepared.rows.length,
    issues: issues.slice(0, 8),
    issueCount: issues.length,
    failures,
    submitting,
    progress,
    ready,
    chooseFile,
    clearFile,
    downloadTemplate,
    upload,
  };
}
