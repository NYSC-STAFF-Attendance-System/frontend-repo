"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
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
 * Any field with type="password" gets a reveal toggle automatically - see
 * below for why that is a deliberate feature and not a security hole.
 *
 * Usage:
 *   <Field label="Staff ID" name="staffId" error={errors.staffId} />
 */
export function Field({
  label,
  error,
  hint,
  id,
  className,
  type = "text",
  ...inputProps
}: FieldProps) {
  // useId gives a unique string per rendered instance, and one that matches
  // between server and client so hydration does not complain. Hand-written ids
  // break the moment a field is rendered twice on one page.
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>

      <div className="relative">
        <Input
          id={fieldId}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          // Room for the toggle so long passwords do not run underneath it.
          className={cn(isPassword && "pr-12")}
          {...inputProps}
        />

        {isPassword ? <RevealToggle revealed={revealed} onToggle={setRevealed} /> : null}
      </div>

      {error ? (
        // role="alert" so the message is announced when it appears after a
        // failed submit, rather than added to the page silently.
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * Show/hide control for a password field.
 *
 * Worth having on a phone specifically: staff are typing into a small keyboard,
 * one handed, often outdoors, and a mistyped password they cannot see is the
 * most common reason a login fails twice in a row. Letting someone check what
 * they typed reduces failed attempts more than hiding it prevents shoulder
 * surfing - and the field still starts masked either way.
 *
 * The state is deliberately not shared between fields. On the change password
 * screen, revealing the current password should not also reveal the new one.
 */
function RevealToggle({
  revealed,
  onToggle,
}: {
  revealed: boolean;
  onToggle: (next: boolean) => void;
}) {
  const Icon = revealed ? EyeOff : Eye;

  return (
    <button
      // type="button" matters: inside a form, a button with no type defaults to
      // submit, so tapping this would try to log the person in.
      type="button"
      onClick={() => onToggle(!revealed)}
      // The label carries the state, so a screen reader hears what the button
      // will do rather than just "button".
      aria-label={revealed ? "Hide password" : "Show password"}
      aria-pressed={revealed}
      // Full height of the input and 48px wide, so it clears the 44px minimum
      // tap target without making the field look crowded.
      className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}
