"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { LoadingState } from "@/components/states";
import { useAttendanceRecord } from "../_hooks/use-attendance-record";

export function AttendanceRecordView({ id }: { id: string }) {
  const record = useAttendanceRecord(id);

  if (record.status === "loading") {
    return <LoadingState label="Loading attendance" />;
  }

  if (record.status === "missing") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-600">
          This record is not in the list you just opened. Go back and choose it again.
        </p>
        <Link href="/admin/attendance" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
          Back to attendance
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link
        href="/admin/attendance"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-nysc hover:underline"
      >
        <ArrowLeft className="size-4" />
        Attendance
      </Link>
      <section className="rounded-[20px] border border-zinc-200/80 bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{record.title}</h1>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {record.fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-800">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-zinc-500">Corrections are not stored on the server.</p>
      </section>
    </div>
  );
}
