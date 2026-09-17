"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { officeScanHref } from "@/lib/office-qr";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  hydrateOfficeQr,
  regenerateOfficeQr,
  setOfficeQrAccepting,
} from "@/lib/store/slices/office-qr-slice";

const FILTERS = { view: "manage" };

export function useOfficeQr() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.officeQr.status);
  const station = useAppSelector((state) => state.officeQr.station);
  const message = useAppSelector((state) => state.officeQr.message);
  const { filters, setFilters } = useQueryFilters(FILTERS);

  const [image, setImage] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void dispatch(hydrateOfficeQr());
  }, [dispatch]);

  useEffect(() => {
    if (!station) return;
    const url = officeScanHref(window.location.origin, station.token);
    setScanUrl(url);
    let active = true;
    QRCode.toDataURL(url, {
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
  }, [station]);

  async function copyPayload() {
    if (!station) return;
    await navigator.clipboard.writeText(scanUrl || station.payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function toggleAccepting(accepting: boolean) {
    setBusy(true);
    await dispatch(setOfficeQrAccepting(accepting));
    setBusy(false);
  }

  async function confirmRegenerate() {
    setBusy(true);
    await dispatch(regenerateOfficeQr());
    setBusy(false);
    setConfirming(false);
  }

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
