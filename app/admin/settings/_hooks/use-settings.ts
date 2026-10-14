"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  patchSettings,
  resetSettings,
  saveSettings,
  type SettingsState,
} from "@/lib/store/slices/settings-slice";

function formatClock(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const mer = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${mer}`;
}

export function cutoffFrom(resumption: string, grace: string) {
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
  const settings = useAppSelector((state) => state.settings.draft);
  const saved = useAppSelector((state) => state.settings.saved);
  const lastSync = useAppSelector((state) => state.settings.lastSync);

  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(saved),
    [saved, settings],
  );
  const cutoff = cutoffFrom(settings.resumption, settings.grace);

  function patch(next: Partial<SettingsState>) {
    dispatch(patchSettings(next));
  }

  function save() {
    dispatch(saveSettings(syncLabel()));
  }

  function reset() {
    dispatch(resetSettings());
  }

  return { settings, lastSync, dirty, cutoff, patch, save, reset };
}

export type { SettingsState };
