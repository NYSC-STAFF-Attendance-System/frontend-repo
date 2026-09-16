import { cn } from "@/lib/utils";

/**
 * Form label. Always paired with an input through htmlFor - see components/field.tsx,
 * which wires the two together so this is never done by hand.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm font-medium text-foreground select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
