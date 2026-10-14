"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MOCK_VALID_TOKEN } from "@/lib/mock";
import { officeScanHref } from "@/lib/office-qr";

/**
 * /dev/qr - DEMO TOOL, NOT PART OF THE PRODUCT.
 *
 * Renders the office poster so the scan flow can be demonstrated without
 * opening the admin dashboard. Prefer /admin/settings/office-qr when signed in
 * as an admin — that page is the real generator, and this one follows its token.
 */
export default function DevQrPage() {
  const [poster, setPoster] = useState<{ url: string; image: string } | null>(null);

  useEffect(() => {
    let active = true;

    api.admin.getOfficeQr().then((result) => {
      const token = result.kind === "success" ? result.station.token : MOCK_VALID_TOKEN;
      const url = officeScanHref(window.location.origin, token);
      return QRCode.toDataURL(url, {
        width: 880,
        margin: 1,
        errorCorrectionLevel: "H",
        color: { dark: "#0d3b24", light: "#ffffff" },
      }).then((image) => {
        if (active) setPoster({ url, image });
      });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-col items-center gap-6 px-6 py-10 text-center">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          National Youth Service Corps
        </p>
        <h1 className="text-2xl font-bold text-foreground">Staff Attendance</h1>
        <p className="text-sm text-muted-foreground">NYSC FCT Secretariat</p>
      </div>

      <div className="rounded-2xl border-4 border-primary/20 bg-white p-4">
        {poster ? (
          // next/image cannot optimise a data URI generated in the browser, and
          // routing it through the image loader would only add a round trip.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster.image}
            alt="Attendance QR code for NYSC FCT Secretariat"
            className="size-64 sm:size-72"
          />
        ) : (
          <div className="size-64 animate-pulse rounded bg-muted sm:size-72" />
        )}
      </div>

      <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
        <li>1. Open the camera on your registered phone.</li>
        <li>2. Point it at this code.</li>
        <li>3. Tap the link, then tap Sign in.</li>
      </ol>

      <p className="mt-2 break-all rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
        {poster?.url ?? "Loading..."}
      </p>

      <p className="text-xs text-muted-foreground">
        Demo tool. Admins generate the live poster at /admin/settings/office-qr.
      </p>
    </main>
  );
}
