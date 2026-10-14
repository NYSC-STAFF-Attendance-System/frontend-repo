"use client";

import { useMemo, useRef, useState } from "react";
import {
  clockToMinutes,
  DEFAULT_CORRECTION_REASON,
  getCorrectionMeta,
  type AttendanceRecord,
} from "../_data";

type OverrideStatus = "present" | "excused" | "late";

export function useAttendanceCorrection(record: AttendanceRecord) {
  const detailsHref = `/admin/attendance/${record.id}`;
  const meta = useMemo(() => getCorrectionMeta(record), [record]);
  const fileInput = useRef<HTMLInputElement>(null);
  const [checkIn, setCheckIn] = useState(meta.proposedCheckIn);
  const [checkOut, setCheckOut] = useState(meta.proposedCheckOut);
  const [override, setOverride] = useState<OverrideStatus>("present");
  const [reason, setReason] = useState(DEFAULT_CORRECTION_REASON);
  const [fileName, setFileName] = useState("Directive_ICT_241023_Signed.pdf");
  const [saved, setSaved] = useState(false);

  const canSave = reason.trim().length >= 20 && Boolean(clockToMinutes(checkIn));
  const originalLate = meta.isLate || record.status === "late";

  function resetFields() {
    setCheckIn(meta.proposedCheckIn);
    setCheckOut(meta.proposedCheckOut);
    setOverride("present");
    setReason(DEFAULT_CORRECTION_REASON);
    setFileName("Directive_ICT_241023_Signed.pdf");
    setSaved(false);
  }

  function handleSave() {
    if (!canSave) return;
    setSaved(true);
  }

  return {
    detailsHref,
    meta,
    fileInput,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    override,
    setOverride,
    reason,
    setReason,
    fileName,
    setFileName,
    saved,
    setSaved,
    canSave,
    originalLate,
    resetFields,
    handleSave,
  };
}

export type { OverrideStatus };
