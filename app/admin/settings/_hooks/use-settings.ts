"use client";

import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "@/components/snackbar";
import { useStaff } from "@/hooks/use-staff";
import { api } from "@/lib/api";
import { adminFailureNotice } from "@/lib/messages";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  hydrateRadius,
  patchSettings,
  resetSettings,
  saveSettings,
  type SettingsState,
} from "@/lib/store/slices/settings-slice";
import type { AdminOffice } from "@/types";

function formatClock(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const mer = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${mer}`;
}

function addMinutes(value: string, delta: number) {
  const [hours, minutes] = value.split(":").map(Number);
  const total = (hours * 60 + minutes + delta + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(total / 60);
  const nextMinute = total % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

function cutoffFrom(resumption: string, grace: string) {
  const [hours, minutes] = resumption.split(":").map(Number);
  const total = hours * 60 + minutes + Number(grace);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return formatClock(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}

function syncLabel() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const mer = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `Today at ${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${mer}`;
}

export function useSettings() {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const staff = useStaff();
  const settings = useAppSelector((state) => state.settings.draft);
  const saved = useAppSelector((state) => state.settings.saved);
  const lastSync = useAppSelector((state) => state.settings.lastSync);
  const [offices, setOffices] = useState<AdminOffice[]>([]);
  const [officeId, setOfficeId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (staff.role === "super_admin") {
      api.admin.listOffices().then((result) => {
        if (!active) return;
        if (result.kind !== "success") {
          const notice = adminFailureNotice(result);
          snackbar({ tone: "error", title: notice.title, description: notice.description });
          return;
        }
        setOffices(result.offices);
        const first = result.offices[0];
        if (!first) return;
        setOfficeId(first.id);
        dispatch(hydrateRadius(first.radiusMeters));
      });
      return () => {
        active = false;
      };
    }

    api.admin.getOffice().then((result) => {
      if (!active) return;
      if (result.kind !== "success") {
        const notice = adminFailureNotice(result);
        snackbar({ tone: "error", title: notice.title, description: notice.description });
        return;
      }
      setOfficeId(result.office.id);
      dispatch(hydrateRadius(result.office.radiusMeters));
    });
    return () => {
      active = false;
    };
  }, [dispatch, snackbar, staff.role]);

  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(saved),
    [saved, settings],
  );
  const cutoff = cutoffFrom(settings.resumption, settings.grace);
  const barredAfter = cutoffFrom(settings.resumption, "90");
  const checkInWindow = `Authorized ${formatClock(addMinutes(settings.resumption, -60))} — ${formatClock(addMinutes(settings.resumption, 90))}`;
  const checkOutWindow = `Authorized ${formatClock(addMinutes(settings.closing, -30))} — ${formatClock(addMinutes(settings.closing, 60))}`;

  function patch(next: Partial<SettingsState>) {
    dispatch(patchSettings(next));
  }

  function chooseOffice(id: string) {
    setOfficeId(id);
    const office = offices.find((item) => item.id === id);
    if (office) dispatch(hydrateRadius(office.radiusMeters));
  }

  async function save() {
    setSaving(true);
    const result = await api.admin.updateOfficeRadius({
      officeId: staff.role === "super_admin" ? officeId : undefined,
      radiusMeters: settings.perimeterM,
    });
    setSaving(false);
    if (result.kind !== "success") {
      const notice = adminFailureNotice(result);
      snackbar({ tone: "error", title: notice.title, description: notice.description });
      return;
    }
    dispatch(hydrateRadius(result.office.radiusMeters));
    dispatch(saveSettings(syncLabel()));
    snackbar({
      tone: "success",
      title: "Office radius saved.",
      description: "Shift times and the other rules stay on this browser.",
    });
  }

  function reset() {
    dispatch(resetSettings());
  }

  return {
    settings,
    lastSync,
    dirty,
    cutoff,
    barredAfter,
    checkInWindow,
    checkOutWindow,
    offices,
    officeId,
    chooseOffice,
    saving,
    patch,
    save,
    reset,
  };
}

export type { SettingsState };
