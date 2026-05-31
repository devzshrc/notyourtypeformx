"use client";

import { cn } from "~/lib/utils";

/**
 * Full-screen loader shown until the hero video can play.
 * A steaming bowl of noodles with chopsticks — 湯気 (yuge, steam) rising.
 */
export function RamenLoader({ done }: { done: boolean }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-700",
        done && "pointer-events-none opacity-0",
      )}
      aria-hidden={done}
      role="status"
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        className="text-foreground"
      >
        {/* steam */}
        <g stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9">
          <path className="steam-wisp" style={{ animationDelay: "0s" }} d="M44 40 C 40 33, 48 30, 44 22" />
          <path className="steam-wisp" style={{ animationDelay: "0.5s" }} d="M60 38 C 56 30, 64 27, 60 18" />
          <path className="steam-wisp" style={{ animationDelay: "1s" }} d="M76 40 C 72 33, 80 30, 76 22" />
        </g>

        {/* chopsticks */}
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="74" y1="20" x2="104" y2="58" />
          <line x1="82" y1="16" x2="110" y2="54" />
        </g>

        {/* bowl */}
        <path
          d="M20 58 H100 C100 84 82 100 60 100 C38 100 20 84 20 58 Z"
          fill="var(--primary)"
        />
        {/* broth surface */}
        <ellipse cx="60" cy="58" rx="40" ry="7" fill="currentColor" opacity="0.12" />
        <ellipse cx="60" cy="58" rx="40" ry="7" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
        {/* noodle swirl + toppings */}
        <path d="M40 56 q10 -6 20 0 q10 6 20 0" stroke="var(--primary-foreground)" strokeWidth="2" fill="none" opacity="0.7" />
        <circle cx="48" cy="54" r="3" fill="var(--primary-foreground)" opacity="0.55" />
        {/* foot */}
        <line x1="48" y1="104" x2="72" y2="104" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <div className="text-center">
        <p className="font-display text-sm text-foreground">読み込み中</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Steeping things…</p>
      </div>
    </div>
  );
}
