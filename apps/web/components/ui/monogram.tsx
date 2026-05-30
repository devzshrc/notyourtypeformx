import { cn } from "~/lib/utils";

/**
 * Deterministic initials avatar. Monochrome, theme-aware. Replaces robohash.
 * Derives 1-2 letters from a name or email, on a muted surface.
 */
function initials(source: string): string {
  const s = source.trim();
  if (!s) return "?";
  const namePart = s.includes("@") ? s.split("@")[0]! : s;
  const words = namePart.split(/[\s._-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return namePart.slice(0, 2).toUpperCase();
}

export function Monogram({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-muted font-medium text-foreground/70 select-none",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
