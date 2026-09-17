"use client";

import Link from "next/link";
import { Screen } from "@/components/screen";
import { assertNever } from "@/lib/utils";
import { StepConfirm } from "./step-confirm";
import { StepDetails } from "./step-details";
import { StepLookup } from "./step-lookup";
import { useRegister, type RegisterStep } from "./use-register";

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
  const { step, stepNumber, title, onFound, onConfirm, onBack, onRegistered } = useRegister();

  return (
    <Screen>
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">Step {stepNumber} of 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">{title}</h1>
      </header>

      <RegisterStepView
        step={step}
        onFound={onFound}
        onConfirm={onConfirm}
        onBack={onBack}
        onRegistered={onRegistered}
      />

      <p className="mt-8 text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </Screen>
  );
}

function RegisterStepView({
  step,
  onFound,
  onConfirm,
  onBack,
  onRegistered,
}: {
  step: RegisterStep;
  onFound: ReturnType<typeof useRegister>["onFound"];
  onConfirm: ReturnType<typeof useRegister>["onConfirm"];
  onBack: ReturnType<typeof useRegister>["onBack"];
  onRegistered: ReturnType<typeof useRegister>["onRegistered"];
}) {
  switch (step.name) {
    case "lookup":
      return <StepLookup onFound={onFound} />;

    case "confirm":
      return <StepConfirm staff={step.staff} onConfirm={onConfirm} onBack={onBack} />;

    case "details":
      return <StepDetails staff={step.staff} onRegistered={onRegistered} />;

    default:
      return assertNever(step);
  }
}
