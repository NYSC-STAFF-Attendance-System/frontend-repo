"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Screen } from "@/components/screen";
import { assertNever } from "@/lib/utils";
import type { StaffLookupResult } from "@/types";
import { StepConfirm } from "./step-confirm";
import { StepDetails } from "./step-details";
import { StepLookup } from "./step-lookup";

/**
 * Where the wizard currently is.
 *
 * A union rather than a step number plus a nullable staff object, so the record
 * only exists on the steps that actually have one. On "lookup" there is no
 * staff member to read, and the type makes that unreadable rather than
 * undefined.
 */
type Step =
  | { name: "lookup" }
  | { name: "confirm"; staff: StaffLookupResult }
  | { name: "details"; staff: StaffLookupResult };

const STEP_LABELS: Record<Step["name"], string> = {
  lookup: "Find your record",
  confirm: "Confirm it is you",
  details: "Set your details",
};

const STEP_NUMBERS: Record<Step["name"], number> = {
  lookup: 1,
  confirm: 2,
  details: 3,
};

/**
 * /register - the staff claim flow.
 *
 * Admins create the staff record first, so this never creates a person. It
 * finds an existing record, confirms it belongs to whoever is holding the
 * phone, and attaches an email, a password and this device to it.
 *
 * No GPS at any point. Location is only ever requested on /scan.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "lookup" });

  const stepNumber = STEP_NUMBERS[step.name];

  return (
    <Screen>
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">Step {stepNumber} of 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          {STEP_LABELS[step.name]}
        </h1>
      </header>

      {renderStep(step, setStep, router)}

      <p className="mt-8 text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </Screen>
  );
}

function renderStep(
  step: Step,
  setStep: (step: Step) => void,
  router: ReturnType<typeof useRouter>,
) {
  switch (step.name) {
    case "lookup":
      return <StepLookup onFound={(staff) => setStep({ name: "confirm", staff })} />;

    case "confirm":
      return (
        <StepConfirm
          staff={step.staff}
          onConfirm={() => setStep({ name: "details", staff: step.staff })}
          onBack={() => setStep({ name: "lookup" })}
        />
      );

    case "details":
      return (
        <StepDetails
          staff={step.staff}
          onRegistered={(email) =>
            // The confirmation lives at /verify-email so the screen shown after
            // registering and the screen reached from the email link are one
            // implementation rather than two that drift apart.
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
          }
        />
      );

    default:
      return assertNever(step);
  }
}
