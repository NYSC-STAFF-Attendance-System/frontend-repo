"use client";

import { Download, Upload, X } from "lucide-react";

import { FilterSelect } from "@/app/admin/_components/filter-select";
import { Button } from "@/components/ui/button";
import { useSeedStaff } from "../_hooks/use-seed-staff";

export function SeedStaffPanel({ onSeeded }: { onSeeded: () => void }) {
  const seed = useSeedStaff(onSeeded);

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Seed staff</h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            Upload a CSV. Each row becomes a staff record that still needs to register. Staff IDs
            are 6 characters or fewer.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={seed.downloadTemplate}
          className="h-10 rounded-xl border-zinc-200 bg-white px-4 text-zinc-700 shadow-none"
        >
          <Download data-icon="inline-start" className="size-4" />
          Template
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-nysc px-4 text-sm font-medium text-white hover:bg-nysc/90">
          <Upload className="size-4" />
          Choose CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            disabled={seed.submitting}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void seed.chooseFile(file);
            }}
          />
        </label>
        {seed.fileName ? (
          <p className="flex items-center gap-2 text-sm text-zinc-600">
            {seed.fileName}
            <button
              type="button"
              className="text-zinc-400 hover:text-zinc-700"
              aria-label="Clear file"
              onClick={seed.clearFile}
              disabled={seed.submitting}
            >
              <X className="size-4" />
            </button>
          </p>
        ) : (
          <p className="text-sm text-zinc-400">staff_id, surname, first_name, rank, department, office_id</p>
        )}
      </div>

      {seed.isSuperAdmin ? (
        <div className="mt-4 max-w-sm">
          <FilterSelect
            aria-label="Office for rows without an office id"
            value={seed.officeId}
            onChange={seed.setOfficeId}
            placeholder="Office"
            options={seed.offices.map((office) => ({ value: office.id, label: office.name }))}
            className="h-10 rounded-xl"
          />
          <p className="mt-1 text-xs text-zinc-400">Used when a row leaves office_id blank.</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">Rows are added to your office.</p>
      )}

      {seed.issueCount > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-danger">
          {seed.issues.map((issue) => (
            <li key={`${issue.row}-${issue.message}`}>
              Row {issue.row}: {issue.message}
            </li>
          ))}
          {seed.issueCount > seed.issues.length ? (
            <li>And {seed.issueCount - seed.issues.length} more.</li>
          ) : null}
        </ul>
      ) : null}

      {seed.preview.length > 0 && seed.issueCount === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          {seed.total} {seed.total === 1 ? "row" : "rows"} ready
          {seed.total > seed.preview.length ? `, starting with ${seed.preview.map((row) => row.staffId).join(", ")}` : ""}.
        </p>
      ) : null}

      {seed.failures.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-danger">
          {seed.failures.map((failure) => (
            <li key={`${failure.row}-${failure.message}`}>
              Row {failure.row}: {failure.message}
            </li>
          ))}
        </ul>
      ) : null}

      <Button
        type="button"
        disabled={!seed.ready}
        onClick={() => void seed.upload()}
        className="mt-4 h-10 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90"
      >
        {seed.submitting && seed.progress
          ? `Seeding ${seed.progress.done} of ${seed.progress.total}...`
          : "Seed staff"}
      </Button>
    </section>
  );
}
