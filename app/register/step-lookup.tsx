"use client";

import Link from "next/link";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { assertNever } from "@/lib/utils";
import type { StaffLookupResult } from "@/types";
import { useStepLookup, type LookupFailure } from "./use-step-lookup";

/**
 * Registration is a claim, not a sign up. An admin creates the staff record
 * first, so the only thing this step can do is ask whether a record exists.
 * Nothing is created here.
 */
export function StepLookup({ onFound }: { onFound: (staff: StaffLookupResult) => void }) {
  const { staffId, setStaffId, submitting, fieldError, failure, submit } = useStepLookup(onFound);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field
        label="Staff ID"
        name="staffId"
        value={staffId}
        onChange={(event) => setStaffId(event.target.value)}
        error={fieldError}
        hint="The file number your office issued you, for example NYSC/FCT/0842."
        autoCapitalize="characters"
        autoCorrect="off"
        disabled={submitting}
      />

      {failure ? <LookupFailureMessage failure={failure} /> : null}

      <Button type="submit" size="xl" disabled={submitting} className="mt-1 w-full">
        {submitting ? "Checking..." : "Continue"}
      </Button>
    </form>
  );
}

function LookupFailureMessage({ failure }: { failure: LookupFailure }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {renderFailure(failure)}
    </div>
  );
}

function renderFailure(failure: LookupFailure) {
  switch (failure.kind) {
    case "not_found":
      return "We could not find that staff ID. Check it for typos, or ask your office admin to add you to the staff list first.";
    case "already_registered":
      return (
        <>
          {failure.staff.staffId} has already been registered.{" "}
          <Link href="/login" className="underline underline-offset-4">
            Sign in instead
          </Link>
          , or contact your office admin if this was not you.
        </>
      );
    case "offline":
      return "You appear to be offline. Check your connection and try again.";
    case "error":
      return failure.message;
    default:
      return assertNever(failure);
  }
}
