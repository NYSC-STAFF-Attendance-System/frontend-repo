import { cn } from "@/lib/utils";

/**
 * Text input used by every form in the staff app.
 *
 * Two sizing decisions are deliberate and should not be tuned down:
 *
 * h-12 (48px) keeps the tap area above the 44px minimum. Staff fill these in
 * one-handed on a phone, sometimes standing.
 *
 * text-base (16px) is what stops iOS Safari zooming the whole page when a field
 * receives focus. Safari zooms on any input below 16px, and once it has zoomed,
 * the layout is wrong for the rest of the session. This is the single most
 * common mobile web bug in forms.
 */
function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-md border border-input bg-background px-3 text-base text-foreground",
        "placeholder:text-muted-foreground",
        "transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Driven by aria-invalid rather than a prop, so the visual state and the
        // state a screen reader announces can never disagree.
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
