"use client";

import { useInviteAdmin } from "../_hooks/use-invite-admin";
import { FilterSelect } from "@/app/admin/_components/filter-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Superuser invites an office admin. The server emails the accept link.
 */
export function InviteAdminPanel() {
  const form = useInviteAdmin();

  if (!form.isSuperAdmin) return null;

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
      <h2 className="text-lg font-semibold text-zinc-900">Invite an admin</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Send an invitation for one office. They set a password from the email, then sign in here.
      </p>
      <form onSubmit={form.submit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input
          name="firstName"
          value={form.firstName}
          onChange={(event) => form.setFirstName(event.target.value)}
          placeholder="First name"
          autoComplete="off"
          disabled={form.submitting}
          className="h-10 rounded-xl text-sm"
        />
        <Input
          name="surname"
          value={form.surname}
          onChange={(event) => form.setSurname(event.target.value)}
          placeholder="Surname"
          autoComplete="off"
          disabled={form.submitting}
          className="h-10 rounded-xl text-sm"
        />
        <Input
          type="email"
          name="inviteEmail"
          value={form.email}
          onChange={(event) => form.setEmail(event.target.value)}
          placeholder="Work email"
          autoComplete="off"
          disabled={form.submitting}
          className="h-10 rounded-xl text-sm"
        />
        <FilterSelect
          aria-label="Office"
          value={form.officeId}
          onChange={form.setOfficeId}
          placeholder="Office"
          options={form.offices.map((office) => ({
            value: office.id,
            label: office.name,
          }))}
          className="h-10 rounded-xl"
        />
        <Button
          type="submit"
          disabled={form.submitting || !form.ready}
          className="h-10 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90 sm:col-span-2 sm:w-fit"
        >
          {form.submitting ? "Sending..." : "Send invite"}
        </Button>
      </form>
    </section>
  );
}
