"use client";

import { useMemo } from "react";
import { getAttendanceDetail, type AttendanceRecord } from "../_data";

function splitClock(value: string | null) {
  if (!value) return { time: "—", mer: "" };
  const [time, mer] = value.split(" ");
  return { time, mer: mer ?? "" };
}

export function useAttendanceDetails(record: AttendanceRecord) {
  const detail = useMemo(() => getAttendanceDetail(record), [record]);

  return {
    detail,
    checkIn: splitClock(record.checkIn),
    checkOut: splitClock(record.checkOut),
  };
}
