import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The NYSC seal.
 *
 * Rendered on a light surface everywhere. The emblem is a dark ring with a red
 * flame and the green flag inside it, so it loses definition on a coloured bar -
 * which is why the app chrome is white and the green is carried by the actions
 * instead.
 *
 * alt is empty wherever the mark sits next to the app name, because the name is
 * already the accessible label and a screen reader announcing both would read
 * the same thing twice.
 */
export function BrandMark({
  size = 32,
  className,
  alt = "",
}: {
  size?: number;
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src="/nysc-logo.png"
      alt={alt}
      width={size}
      height={size}
      priority
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Seal plus wordmark, for the top of the public screens.
 *
 * "Staff Attendance" is the second line on purpose: this app and the admin
 * dashboard sit behind the same emblem, and the word Staff is what tells
 * someone which of the two they have opened.
 */
export function BrandLockup({
  className,
  align = "center",
}: {
  className?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <BrandMark size={56} />
      <div className="flex flex-col">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
          National Youth Service Corps
        </span>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Staff Attendance
        </span>
      </div>
    </div>
  );
}
