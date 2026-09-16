"use client";

import { Button } from "@/components/ui/button";
import type { StaffLookupResult } from "@/types";

/**
 * Shows the record the backend returned so the person can confirm it is theirs
 * before they attach an email and a password to it.
 *
 * This step is the reason lookup returns so little. Someone typing staff IDs
 * into the previous screen sees only a name and an office, never a contact
 * detail, and cannot get past here without the record actually being theirs.
 */
export function StepConfirm({
  staff,
  onConfirm,
  onBack,
}: {
  staff: StaffLookupResult;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Your office has this record on file. Check it is you before continuing.
      </p>

      <dl className="divide-y divide-border rounded-md border border-border">
        <div className="flex flex-col gap-0.5 px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Name</dt>
          <dd className="text-base font-medium text-foreground">{staff.fullName}</dd>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Staff ID</dt>
          <dd className="text-base font-medium text-foreground">{staff.staffId}</dd>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Office</dt>
          <dd className="text-base font-medium text-foreground">{staff.officeName}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <Button size="xl" onClick={onConfirm} className="w-full">
          Yes, this is me
        </Button>
        <Button variant="ghost" size="lg" onClick={onBack} className="w-full">
          That is not me
        </Button>
      </div>
    </div>
  );
}
