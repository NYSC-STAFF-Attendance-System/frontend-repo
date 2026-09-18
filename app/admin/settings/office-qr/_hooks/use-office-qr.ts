"use client";

import QRCode from "qrcode";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { officeScanHref } from "@/lib/office-qr";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  hydrateOfficeQr,
  regenerateOfficeQr,
  setOfficeQrAccepting,
} from "@/lib/store/slices/office-qr-slice";

const FILTERS = { view: "manage" };

function subscribeNever() {
  return () => {};
}

function readOrigin() {
  return window.location.origin;
}

export function useOfficeQr() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.officeQr.status);
  const station = useAppSelector((state) => state.officeQr.station);
  const message = useAppSelector((state) => state.officeQr.message);
  const { filters, setFilters } = useQueryFilters(FILTERS);
  const origin = useSyncExternalStore(subscribeNever, readOrigin, () => "");

  const [image, setImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const scanUrl = station && origin ? officeScanHref(origin, station.token) : "";

  useEffect(() => {
    void dispatch(hydrateOfficeQr());
  }, [dispatch]);

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
