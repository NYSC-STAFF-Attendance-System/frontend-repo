"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { StaffLookupOutcome, StaffLookupResult } from "@/types";

export type LookupFailure = Exclude<StaffLookupOutcome, { kind: "found" }>;

export function useStepLookup(onFound: (staff: StaffLookupResult) => void) {
  const [staffId, setStaffId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [failure, setFailure] = useState<LookupFailure | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    if (!staffId.trim()) {
      setFieldError("Enter your staff ID.");
      return;
    }
    setFieldError(null);

    setSubmitting(true);
    const outcome = await api.registration.lookupStaffId(staffId);
    setSubmitting(false);

    if (outcome.kind === "found") {
      onFound(outcome.staff);
      return;
    }
    setFailure(outcome);
  }

  return { staffId, setStaffId, submitting, fieldError, failure, submit };
}
