"use client";

import { useEffect, useState } from "react";
import { useSnackbar } from "@/components/snackbar";
import { useStaff } from "@/hooks/use-staff";
import { api } from "@/lib/api";
import { adminFailureNotice } from "@/lib/messages";
import type { AdminOffice } from "@/types";

export function useInviteAdmin() {
  const staff = useStaff();
  const isSuperAdmin = staff.role === "super_admin";
  const snackbar = useSnackbar();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [offices, setOffices] = useState<AdminOffice[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let active = true;
    api.admin.listOffices().then((result) => {
      if (!active) return;
      if (result.kind !== "success") {
        const notice = adminFailureNotice(result);
        snackbar({ tone: "error", title: notice.title, description: notice.description });
        return;
      }
      setOffices(result.offices);
      setOfficeId((current) => current || result.offices[0]?.id || "");
    });
    return () => {
      active = false;
    };
  }, [isSuperAdmin, snackbar]);

  const ready =
    email.trim().length > 0 &&
    firstName.trim().length > 0 &&
    surname.trim().length > 0 &&
    officeId.length > 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    const result = await api.admin.inviteAdmin({
      email: email.trim(),
      firstName: firstName.trim(),
      surname: surname.trim(),
      officeId,
    });
    setSubmitting(false);
    if (result.kind === "sent") {
      snackbar({ tone: "success", title: result.message, description: result.email });
      setEmail("");
      setFirstName("");
      setSurname("");
      return;
    }
    const notice = adminFailureNotice(result);
    snackbar({ tone: "error", title: notice.title, description: notice.description });
  }

  return {
    isSuperAdmin,
    email,
    setEmail,
    firstName,
    setFirstName,
    surname,
    setSurname,
    officeId,
    setOfficeId,
    offices,
    submitting,
    ready,
    submit,
  };
}
