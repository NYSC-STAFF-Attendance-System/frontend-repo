"use client";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import type { StaffLookupResult } from "@/types";
import { useStepDetails } from "./use-step-details";

/**
 * Final step: the details the staff member supplies themselves, plus the device
 * binding.
 *
 * Note what is not on this form. Name, office and department already exist on
 * the record and are not editable here - an admin owns those. Asking for them
 * again would let someone overwrite a record they had merely guessed the ID of.
 */
export function StepDetails({
  staff,
  onRegistered,
}: {
  staff: StaffLookupResult;
  onRegistered: (email: string) => void;
}) {
  const {
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirm,
    setConfirm,
    submitting,
    errors,
    formError,
    submit,
  } = useStepDetails(staff, onRegistered);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field
        label="Email address"
        name="email"
        type="email"
        inputMode="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        hint="We send a verification link here before you can sign in."
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        disabled={submitting}
      />

      <Field
        label="Phone number"
        name="phone"
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={errors.phone}
        autoComplete="tel"
        disabled={submitting}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        hint="At least 8 characters."
        autoComplete="new-password"
        disabled={submitting}
      />

      <Field
        label="Confirm password"
        name="confirm"
        type="password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        error={errors.confirm}
        autoComplete="new-password"
        disabled={submitting}
      />

      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        This phone becomes your attendance device. You will only be able to sign
        in and record attendance from it. If you change phone, your office admin
        has to reset it for you.
      </p>

      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="xl" disabled={submitting} className="mt-1 w-full">
        {submitting ? "Creating your account..." : "Create account"}
      </Button>
    </form>
  );
}
