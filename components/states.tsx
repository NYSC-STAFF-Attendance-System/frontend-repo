import { AlertTriangle, Inbox, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The three states every screen in this app has to be able to show. Kept
 * together so loading looks like loading everywhere, and so no screen quietly
 * ships without one of them.
 */

/**
 * Shown while a request is in flight.
 *
 * role="status" with aria-live announces the change to a screen reader, and the
 * visible label is what a sighted user reads - a bare spinner tells someone on a
 * slow connection nothing about what is happening or how long it might take.
 */
export function LoadingState({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}
    >
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/**
 * Shown when something failed and the user may be able to do something about it.
 *
 * onRetry is optional because not every failure is retryable - a rotated QR code
 * will not resolve on a second attempt, and offering a button that cannot work
 * is worse than offering none.
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}
    >
      <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="lg" onClick={onRetry} className="mt-2">
          <RefreshCw aria-hidden="true" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Shown when a request succeeded and there is genuinely nothing to display.
 *
 * Distinct from ErrorState on purpose. An empty history is a normal situation
 * for a new staff member, and dressing it up as a failure teaches people to
 * distrust the app.
 */
export function EmptyState({
  title,
  message,
  action,
  className,
}: {
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}>
      <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">{title}</p>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
