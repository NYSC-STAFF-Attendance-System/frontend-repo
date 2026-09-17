"use client"

import { useInviteAdmin } from "../_hooks/use-invite-admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { assertNever } from "@/lib/utils"
import type { InviteAdminResult } from "@/types"

/**
 * Super admins invite an existing staff member. The mock cannot send email, so
 * the generated link is shown on this screen for the prototype.
 */
export function InviteAdminPanel() {
  const { isSuperAdmin, email, setEmail, submitting, result, submit } = useInviteAdmin()

  if (!isSuperAdmin) return null

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
      <h2 className="text-lg font-semibold text-zinc-900">Invite an admin</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Send a verification link to a staff email. After they open it, they sign
        in with that email to reach the admin dashboard.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          name="inviteEmail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="c.ibrahim@nysc.gov.ng"
          autoComplete="off"
          disabled={submitting}
          className="h-10 rounded-xl text-sm sm:max-w-sm"
        />
        <Button
          type="submit"
          disabled={submitting || email.trim().length === 0}
          className="h-10 rounded-xl bg-nysc px-4 text-white hover:bg-nysc/90"
        >
          {submitting ? "Sending..." : "Send invite"}
        </Button>
      </form>
      {result ? <InviteResult result={result} /> : null}
    </section>
  )
}

function InviteResult({ result }: { result: InviteAdminResult }) {
  switch (result.kind) {
    case "sent":
      return (
        <p className="mt-3 text-sm text-zinc-600">
          Invite sent to <span className="font-medium text-zinc-900">{result.email}</span>.
          Prototype link:{" "}
          <a href={result.inviteUrl} className="break-all text-nysc underline-offset-4 hover:underline">
            {result.inviteUrl}
          </a>
        </p>
      )
    case "not_staff":
      return (
        <p role="alert" className="mt-3 text-sm text-red-600">
          That address is not a registered staff email.
        </p>
      )
    case "already_admin":
      return (
        <p role="alert" className="mt-3 text-sm text-zinc-600">
          That staff member is already an admin.
        </p>
      )
    case "forbidden":
      return (
        <p role="alert" className="mt-3 text-sm text-red-600">
          Only a super admin can send invitations.
        </p>
      )
    case "offline":
      return (
        <p role="alert" className="mt-3 text-sm text-red-600">
          You appear to be offline. Try again.
        </p>
      )
    case "error":
      return (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {result.message}
        </p>
      )
    default:
      return assertNever(result)
  }
}
