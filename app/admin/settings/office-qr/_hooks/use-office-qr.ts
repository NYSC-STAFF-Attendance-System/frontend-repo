"use client";

import QRCode from "qrcode";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useSnackbar } from "@/components/snackbar";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useStaff } from "@/hooks/use-staff";
import { api } from "@/lib/api";
import { adminFailureNotice } from "@/lib/messages";
import { officeScanHref } from "@/lib/office-qr";
import type { AdminOffice, OfficeQrStation } from "@/types";

const FILTERS = { view: "manage" };

function subscribeNever() {
  return () => {};
}

function readOrigin() {
  return window.location.origin;
}

export function useOfficeQr() {
  const staff = useStaff();
  const snackbar = useSnackbar();
  const { filters, setFilters } = useQueryFilters(FILTERS);
  const origin = useSyncExternalStore(subscribeNever, readOrigin, () => "");
  const [offices, setOffices] = useState<AdminOffice[]>([]);
  const [officeId, setOfficeId] = useState("");
  const [station, setStation] = useState<OfficeQrStation | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const scanUrl = station && origin ? officeScanHref(origin, station.token) : "";

  useEffect(() => {
    if (filters.view !== "kiosk") return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFilters({ view: "manage" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filters.view, setFilters]);

  useEffect(() => {
    let active = true;

    async function load() {
      setStatus("loading");
      if (staff.role === "super_admin") {
        const listed = await api.admin.listOffices();
        if (!active) return;
        if (listed.kind !== "success") {
          setStatus("error");
          const notice = adminFailureNotice(listed);
          setMessage(notice.title);
          snackbar({ tone: "error", title: notice.title, description: notice.description });
          return;
        }
        setOffices(listed.offices);
        const id = officeId || listed.offices[0]?.id || "";
        if (!officeId && id) setOfficeId(id);
        if (!id) {
          setStatus("error");
          setMessage("No offices yet.");
          return;
        }
        const result = await api.admin.getOfficeQr(id);
        if (!active) return;
        if (result.kind !== "success") {
          setStatus("error");
          const notice = adminFailureNotice(result);
          setMessage(notice.title);
          snackbar({ tone: "error", title: notice.title, description: notice.description });
          return;
        }
        setStation(result.station);
        setStatus("ready");
        setMessage(null);
        return;
      }

      const result = await api.admin.getOfficeQr();
      if (!active) return;
      if (result.kind !== "success") {
        setStatus("error");
        const notice = adminFailureNotice(result);
        setMessage(notice.title);
        snackbar({ tone: "error", title: notice.title, description: notice.description });
        return;
      }
      setStation(result.station);
      setOffices([]);
      setStatus("ready");
      setMessage(null);
    }

    void load();
    return () => {
      active = false;
    };
  }, [officeId, snackbar, staff.role]);

  useEffect(() => {
    if (!scanUrl) return;
    let active = true;
    QRCode.toDataURL(scanUrl, {
      width: 880,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#188c44", light: "#ffffff" },
    }).then((next) => {
      if (active) setImage(next);
    });
    return () => {
      active = false;
    };
  }, [scanUrl]);

  async function copyPayload() {
    if (!station) return;
    await navigator.clipboard.writeText(scanUrl || station.payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function toggleAccepting(accepting: boolean) {
    setStation((current) => (current ? { ...current, acceptingScans: accepting } : current));
  }

  async function confirmRegenerate() {
    if (!station) return;
    setBusy(true);
    const result = await api.admin.regenerateOfficeQr(
      staff.role === "super_admin" ? station.officeId : undefined,
    );
    setBusy(false);
    setConfirming(false);
    if (result.kind !== "success") {
      const notice = adminFailureNotice(result);
      snackbar({ tone: "error", title: notice.title, description: notice.description });
      return;
    }
    setStation(result.station);
    snackbar({
      tone: "success",
      title: "QR code regenerated.",
      description: "Reprint the poster. The previous code no longer works.",
    });
  }

  const officeOptions =
    offices.length > 0
      ? offices.map((office) => ({ value: office.id, label: office.name }))
      : station
        ? [{ value: station.officeId, label: station.officeName }]
        : [];

  return {
    status,
    station,
    message,
    image,
    scanUrl,
    copied,
    confirming,
    busy,
    view: filters.view,
    officeId: officeId || station?.officeId || "",
    officeOptions,
    setOfficeId,
    openKiosk: () => setFilters({ view: "kiosk" }),
    closeKiosk: () => setFilters({ view: "manage" }),
    printPoster: () => window.print(),
    copyPayload,
    toggleAccepting,
    askRegenerate: () => setConfirming(true),
    cancelRegenerate: () => setConfirming(false),
    confirmRegenerate,
  };
}
