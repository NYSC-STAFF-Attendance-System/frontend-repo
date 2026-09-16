import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

const LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  checked_out: "Checked out",
  incomplete: "Incomplete",
};

/**
 * Three tones, not five. Late and Incomplete share the warning colour because
 * they mean the same thing to a staff member glancing down a list: the day was
 * not clean, but nothing was refused.
 */
const TONES: Record<AttendanceStatus, string> = {
  present: "border-success/30 bg-success/10 text-success",
  checked_out: "border-border bg-muted text-muted-foreground",
  late: "border-warning/30 bg-warning/10 text-warning",
  incomplete: "border-warning/30 bg-warning/10 text-warning",
  absent: "border-destructive/30 bg-destructive/10 text-destructive",
};

/**
 * The status the backend assigned to a day.
 *
 * Rendered as text, never as a bare colour. A green dot on its own tells
 * someone with a colour vision deficiency nothing at all.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: AttendanceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        TONES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
