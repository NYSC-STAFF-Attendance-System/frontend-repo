"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StaffLookupResult } from "@/types";

export type RegisterStep =
  | { name: "lookup" }
  | { name: "confirm"; staff: StaffLookupResult }
  | { name: "details"; staff: StaffLookupResult };

const STEP_LABELS: Record<RegisterStep["name"], string> = {
  lookup: "Find your record",
  confirm: "Confirm it is you",
  details: "Set your details",
};

const STEP_NUMBERS: Record<RegisterStep["name"], number> = {
  lookup: 1,
  confirm: 2,
  details: 3,
};

export function useRegister() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>({ name: "lookup" });

  return {
    step,
    stepNumber: STEP_NUMBERS[step.name],
    title: STEP_LABELS[step.name],
    onFound: (staff: StaffLookupResult) => setStep({ name: "confirm", staff }),
    onConfirm: () => {
      if (step.name === "confirm") setStep({ name: "details", staff: step.staff });
    },
    onBack: () => setStep({ name: "lookup" }),
    onRegistered: (email: string) =>
      router.push(`/verify-email?email=${encodeURIComponent(email)}`),
  };
}
