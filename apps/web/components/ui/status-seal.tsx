import { cn } from "~/lib/utils";

/**
 * Hanko-style status badge in 伝統色 (traditional Japanese colors).
 * A small carved seal (kanji) + label; the seal's colour name shows on hover.
 *   公 live (萌黄) · 草 draft (鈍色) · 蔵 archived (鈍色) · 締 closed (茜)
 */
type Status = "PUBLISHED" | "DRAFT" | "ARCHIVED" | "CLOSED";

const MAP: Record<Status, { kanji: string; label: string; varName: string; color: string }> = {
  PUBLISHED: { kanji: "公", label: "Live", varName: "--jp-moegi", color: "萌黄 · moegi" },
  DRAFT: { kanji: "草", label: "Draft", varName: "--jp-nibi", color: "鈍色 · nibi" },
  ARCHIVED: { kanji: "蔵", label: "Archived", varName: "--jp-nibi", color: "鈍色 · nibi" },
  CLOSED: { kanji: "締", label: "Closed", varName: "--jp-akane", color: "茜 · akane" },
};

export function StatusSeal({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const s = MAP[status] ?? MAP.DRAFT;
  const c = `var(${s.varName})`;
  return (
    <span
      title={`${s.label} — ${s.color}`}
      className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}
      style={{ color: c }}
    >
      <span
        aria-hidden
        className="flex size-5 items-center justify-center rounded-[4px] text-[11px] leading-none"
        style={{
          color: c,
          borderWidth: 1.5,
          borderStyle: "solid",
          borderColor: c,
          backgroundColor: `color-mix(in oklch, ${c} 14%, transparent)`,
        }}
      >
        {s.kanji}
      </span>
      {s.label}
    </span>
  );
}
