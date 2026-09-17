"use client";

import jsQR from "jsqr";
import { CameraOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/** Why the camera could not be used. Mirrors the shape of LocationFailure. */
export type CameraFailure =
  | { kind: "permission_denied" }
  | { kind: "unavailable" }
  | { kind: "insecure_context" };

type Status = { name: "starting" } | { name: "scanning" } | { name: "failed"; failure: CameraFailure };

/**
 * In-app QR scanner.
 *
 * The primary way staff record attendance is still the phone camera app: the
 * printed code holds a URL, and the camera opens it directly. This exists for
 * the person who is already inside the app and taps "Scan to sign in" - telling
 * them to go and open a different app at that point is poor.
 *
 * Decoding runs in JavaScript rather than through the browser BarcodeDetector
 * API, which Safari on iOS does not implement. A frame is drawn to a canvas,
 * the pixels are handed to jsQR, and the loop repeats until something decodes.
 *
 * The camera stream is stopped on every exit path. A page that keeps a phone
 * camera running after the user has moved on is both a battery drain and,
 * reasonably, alarming.
 */
export function QrScanner({
  onResult,
  onCancel,
}: {
  /** Receives the raw decoded text. The caller decides what is a valid code. */
  onResult: (text: string) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>({ name: "starting" });

  // Held in a ref so the scan loop can stop itself without being restarted by a
  // state change, which would tear down and reopen the camera mid-scan.
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    let stream: MediaStream | null = null;
    let frame = 0;

    function stop() {
      doneRef.current = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
    }

    async function start() {
      // getUserMedia is undefined on an insecure origin. Worth its own message:
      // "camera unavailable" would send someone hunting through phone settings
      // for a permission that was never the problem.
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setStatus({ name: "failed", failure: { kind: "insecure_context" } });
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          // The rear camera. Without this a phone opens the selfie camera,
          // which cannot see a poster on the wall.
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (error) {
        const denied =
          error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "SecurityError");
        setStatus({
          name: "failed",
          failure: { kind: denied ? "permission_denied" : "unavailable" },
        });
        return;
      }

      const video = videoRef.current;
      if (!video) {
        stop();
        return;
      }

      video.srcObject = stream;
      // Required by iOS Safari, which otherwise takes the video fullscreen.
      video.setAttribute("playsinline", "true");
      await video.play().catch(() => undefined);
      setStatus({ name: "scanning" });

      const tick = () => {
        if (doneRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d", { willReadFrequently: true });

        if (canvas && context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
          const found = jsQR(pixels.data, pixels.width, pixels.height, {
            inversionAttempts: "dontInvert",
          });

          if (found?.data) {
            stop();
            onResult(found.data);
            return;
          }
        }

        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    }

    start();

    return stop;
  }, [onResult]);

  if (status.name === "failed") {
    return <CameraFailed failure={status.failure} onCancel={onCancel} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="aspect-square w-full object-cover"
        />

        {/* Corner brackets, so it is obvious where to aim. Purely decorative. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="relative size-48">
            <span className="absolute left-0 top-0 size-8 rounded-tl-lg border-l-4 border-t-4 border-white/90" />
            <span className="absolute right-0 top-0 size-8 rounded-tr-lg border-r-4 border-t-4 border-white/90" />
            <span className="absolute bottom-0 left-0 size-8 rounded-bl-lg border-b-4 border-l-4 border-white/90" />
            <span className="absolute bottom-0 right-0 size-8 rounded-br-lg border-b-4 border-r-4 border-white/90" />
          </div>
        </div>

        {status.name === "starting" ? (
          <p className="absolute inset-0 grid place-items-center text-sm text-white">
            Starting camera...
          </p>
        ) : null}
      </div>

      {/* Never shown. It only exists as a surface to read pixels from. */}
      <canvas ref={canvasRef} className="hidden" />

      <p role="status" aria-live="polite" className="text-center text-sm text-muted-foreground">
        Point at the attendance code displayed at your office.
      </p>

      <Button variant="ghost" size="lg" onClick={onCancel} className="mt-auto w-full">
        <X aria-hidden="true" />
        Cancel
      </Button>
    </div>
  );
}

function CameraFailed({
  failure,
  onCancel,
}: {
  failure: CameraFailure;
  onCancel: () => void;
}) {
  const { title, message } = describe(failure);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <CameraOff aria-hidden="true" className="size-10 text-destructive" />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        You can still use your phone camera app to scan the code at your office.
        It opens this page directly.
      </p>
      <Button variant="outline" size="lg" onClick={onCancel} className="w-full">
        Go back
      </Button>
    </div>
  );
}

function describe(failure: CameraFailure): { title: string; message: string } {
  switch (failure.kind) {
    case "permission_denied":
      return {
        title: "Camera is blocked",
        message:
          "Allow camera access for this site in your browser settings, then try again.",
      };
    case "insecure_context":
      return {
        title: "Camera needs a secure connection",
        message:
          "This page is not being served over HTTPS, so the browser will not open the camera.",
      };
    case "unavailable":
      return {
        title: "Camera is not available",
        message: "No camera could be opened on this device.",
      };
  }
}
