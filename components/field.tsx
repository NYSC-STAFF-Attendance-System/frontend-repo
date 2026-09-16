"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = React.ComponentProps<"input"> & {
  label: string;
  /** Shown under the field in red. Null or undefined means the field is fine. */
  error?: string | null;
  /** Shown under the field in grey when there is no error. */
  hint?: string;
};

/**
 * A labelled text input with its error message, used by every form.
 *
 * Exists so the accessibility wiring is written once instead of on every field:
 * the label points at the input, the input announces its own error, and the
 * invalid state is carried by aria-invalid rather than colour alone. Colour is
 * not information to someone who cannot see it.
 *
 * Usage:
 *   <Field label="Staff ID" name="staffId" error={errors.staffId} />
 */
export function Field({ label, error, hint, id, className, ...inputProps }: FieldProps) {
  // useId gives a unique string per rendered instance, and one that matches
  // between server and client so hydration does not complain. Hand-written ids
  // break the moment a field is rendered twice on one page.
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error ? (
        // role="alert" so the message is announced when it appears after a
        // failed submit, not silently added to the page.
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
