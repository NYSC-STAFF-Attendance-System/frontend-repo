import { cn } from "@/lib/utils";

/**
 * Page wrapper for every staff screen.
 *
 * Designed at 375px and capped at 28rem so the layout stays a phone layout when
 * someone opens it on a laptop, rather than stretching one column across
 * 1400px. Staff use this on a phone; the cap is not a desktop design, it is a
 * guard against an accidental one.
 */
export function Screen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6", className)}>
      {children}
    </main>
  );
}
