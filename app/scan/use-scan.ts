"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import { requestPosition } from "@/lib/geolocation";
import type {
  AttendanceOutcome,
  LocationFailure,
  Office,
  ScanResolution,
  TodayProgress,
} from "@/types";

export type ScanViewState =
  | { name: "no_token" }
  | { name: "resolving" }
  | { name: "unresolved"; resolution: Exclude<ScanResolution, { kind: "resolved" }> }
  | { name: "ready"; office: Office; progress: TodayProgress }
  | { name: "locating"; office: Office; progress: TodayProgress }
  | {
      name: "location_failed";
      office: Office;
      progress: TodayProgress;
      failure: LocationFailure;
    }
  | { name: "submitting"; office: Office; progress: TodayProgress }
  | { name: "outcome"; office: Office; progress: TodayProgress; outcome: AttendanceOutcome };

export function useScan() {
  const token = useSearchParams().get("t");
  const [state, setState] = useState<ScanViewState>(
    token ? { name: "resolving" } : { name: "no_token" },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    Promise.all([api.attendance.resolveToken(token), api.attendance.today()]).then(
      ([resolution, today]) => {
        if (!active) return;
        if (resolution.kind !== "resolved") {
          setState({ name: "unresolved", resolution });
          return;
        }
        const day = today.kind === "success" ? today.day : null;
        const progress: TodayProgress = !day?.signInAt
          ? "not_started"
          : day.signOutAt
            ? "complete"
            : "signed_in";
        setState({ name: "ready", office: resolution.office, progress });
      },
    );

    return () => {
      active = false;
    };
  }, [token]);

  const record = useCallback(
    async (office: Office, progress: TodayProgress) => {
      if (!token) return;
      setState({ name: "locating", office, progress });
      const position = await requestPosition();
      if (!position.ok) {
        setState({ name: "location_failed", office, progress, failure: position.failure });
        return;
      }
      const deviceId = getDeviceId();
      if (!deviceId) {
        setState({
          name: "outcome",
          office,
          progress,
          outcome: {
            kind: "error",
            message: "This browser is blocking site data, so we cannot identify your phone.",
          },
        });
        return;
      }
      setState({ name: "submitting", office, progress });
      const outcome = await api.attendance.submit({
        token,
        deviceId,
        coordinates: position.coordinates,
      });
      setState({ name: "outcome", office, progress, outcome });
    },
    [token],
  );

  const retryOutcome = useCallback(() => {
    if (state.name !== "outcome") return;
    void record(state.office, state.progress);
  }, [record, state]);

  return { state, record, retryOutcome };
}
