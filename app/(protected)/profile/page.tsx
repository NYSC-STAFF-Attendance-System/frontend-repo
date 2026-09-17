"use client";

import { KeyRound, LogOut, Smartphone } from "lucide-react";
import Link from "next/link";
import { useProfile } from "./use-profile";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";
import { formatDayLabel } from "@/lib/format";

/**
 * /profile - the staff member's own record and their device binding.
 *
 * Everything on the details list is read only. Name, rank, department and
 * office belong to the record an admin created; letting staff edit them here
 * would let people quietly move themselves between offices.
 */
export default function ProfilePage() {
  const { staff, signingOut, handleSignOut } = useProfile();

  return (
    <Screen className="gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">
          {staff.fullName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{staff.staffId}</p>
      </header>

      <dl className="divide-y divide-border rounded-lg border border-border text-sm">
        <Row label="Email" value={staff.email} />
        <Row label="Rank" value={staff.rank} />
        <Row label="Department" value={staff.department.name} />
        <Row label="Office" value={staff.office.name} />
      </dl>

      <section className="flex flex-col gap-2 rounded-lg border border-border p-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Smartphone aria-hidden="true" className="size-4" />
          Registered device
        </h2>
        <p className="text-sm text-muted-foreground">
          {staff.deviceBoundAt
            ? `This phone has been your attendance device since ${formatDayLabel(
                staff.deviceBoundAt.slice(0, 10),
              )}.`
            : "No phone is registered to this account yet."}
        </p>
        <p className="text-sm text-muted-foreground">
          Attendance only records from this phone. You cannot move it yourself.
          If you change or lose your phone, ask your office admin to reset the
          binding for you.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        <Button
          render={<Link href="/profile/password" />}
          nativeButton={false}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <KeyRound aria-hidden="true" />
          Change password
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full"
        >
          <LogOut aria-hidden="true" />
          {signingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium wrap-break-words text-foreground">
        {value}
      </dd>
    </div>
  );
}
