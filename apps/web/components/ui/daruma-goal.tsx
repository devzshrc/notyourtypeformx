"use client";

import { cn } from "~/lib/utils";

/**
 * Daruma (達磨) goal tracker — the wishing doll. You paint the left eye when you
 * set a goal (make your first form) and the right eye when it comes true (first
 * response). 七転び八起き — fall seven, rise eight.
 */
export function DarumaGoal({
  madeForm,
  gotResponse,
}: {
  madeForm: boolean;
  gotResponse: boolean;
}) {
  const both = madeForm && gotResponse;
  return (
    <div className="flex items-center gap-5 rounded-xl border border-border/60 bg-card p-5">
      <Daruma left={madeForm} right={gotResponse} />
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold">
          {both ? "満願 — both eyes painted" : "達磨 — paint both eyes"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {both
            ? "Goal set and fulfilled. On to the next wish."
            : "A Daruma tradition: set a goal, fulfil it."}
        </p>
        <ul className="mt-3 space-y-1.5 text-xs">
          <Goal done={madeForm} kanji="形" label="Make your first form" />
          <Goal done={gotResponse} kanji="声" label="Collect your first response" />
        </ul>
      </div>
    </div>
  );
}

function Goal({ done, kanji, label }: { done: boolean; kanji: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-[4px] text-[11px] leading-none",
          done
            ? "text-primary"
            : "text-muted-foreground/50",
        )}
        style={
          done
            ? { backgroundColor: "color-mix(in oklch, var(--primary) 14%, transparent)" }
            : undefined
        }
      >
        {kanji}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      {done && <span className="text-primary">✓</span>}
    </li>
  );
}

function Daruma({ left, right }: { left: boolean; right: boolean }) {
  const red = "var(--jp-akane)";
  const eye = (filled: boolean) =>
    filled ? "var(--foreground)" : "transparent";
  return (
    <svg width="72" height="80" viewBox="0 0 72 80" className="shrink-0">
      {/* body */}
      <path
        d="M36 6 C54 6 64 22 64 44 C64 66 52 76 36 76 C20 76 8 66 8 44 C8 22 18 6 36 6 Z"
        fill={red}
      />
      {/* base shadow */}
      <ellipse cx="36" cy="70" rx="20" ry="5" fill="black" opacity="0.12" />
      {/* face */}
      <ellipse cx="36" cy="38" rx="20" ry="18" fill="oklch(0.96 0.02 80)" />
      {/* eyes */}
      <circle cx="28" cy="36" r="4.5" fill={eye(left)} stroke="var(--foreground)" strokeWidth="1.5" />
      <circle cx="44" cy="36" r="4.5" fill={eye(right)} stroke="var(--foreground)" strokeWidth="1.5" />
      {/* nose/mouth hint */}
      <path d="M33 46 q3 3 6 0" stroke="var(--foreground)" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}
