"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SnackbarTone = "success" | "error" | "info";

type Snack = {
  id: number;
  tone: SnackbarTone;
  title: string;
  description?: string;
};

type ShowSnack = (input: { tone?: SnackbarTone; title: string; description?: string }) => void;

const SnackbarContext = createContext<ShowSnack>(() => {});

/**
 * One message at a time, across the admin pages including sign-in.
 *
 * Mounted once in AdminArea so a sign-out can still be read on the login page.
 */
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snack, setSnack] = useState<Snack | null>(null);

  const show = useCallback<ShowSnack>((input) => {
    setSnack({
      id: Date.now(),
      tone: input.tone ?? "info",
      title: input.title,
      description: input.description,
    });
  }, []);

  useEffect(() => {
    if (!snack) return;
    const timer = window.setTimeout(() => setSnack(null), 3500);
    return () => window.clearTimeout(timer);
  }, [snack]);

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      {snack ? <SnackbarView key={snack.id} snack={snack} onClose={() => setSnack(null)} /> : null}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): ShowSnack {
  return useContext(SnackbarContext);
}

function SnackbarView({ snack, onClose }: { snack: Snack; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className={cn(
          "nysc-snack pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_8px_24px_rgba(16,24,40,0.08)]",
          snack.tone === "success" && "border-nysc/20 bg-nysc-muted text-ink",
          snack.tone === "error" && "border-danger/20 bg-danger-wash text-danger-dark",
          snack.tone === "info" && "border-line bg-white text-ink",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{snack.title}</p>
          {snack.description ? (
            <p
              className={cn(
                "mt-0.5 text-sm",
                snack.tone === "error" ? "text-danger-dark/80" : "text-olive-muted",
              )}
            >
              {snack.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs font-semibold text-olive-muted hover:text-ink"
        >
          Close
        </button>
      </div>
    </div>
  );
}
