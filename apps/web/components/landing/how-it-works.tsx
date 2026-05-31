"use client";

import { Sparkles, PencilLine, Share2 } from "~/components/icons";
import { FadeInView, StaggerView, StaggerViewItem } from "~/components/motion";

// Mapped to 守破離 (Shu-Ha-Ri) — the Japanese stages of mastery:
// follow the form, break it open, then make it your own.
const STEPS = [
  {
    n: "守",
    label: "Shu · follow",
    icon: Sparkles,
    title: "Describe",
    body: "Type what you want to collect. A sentence is enough. Schema drafts the full form, fields and flow included.",
  },
  {
    n: "破",
    label: "Ha · break",
    icon: PencilLine,
    title: "Refine",
    body: "Tweak wording, reorder questions, or add branching by asking. Every change stays in plain language.",
  },
  {
    n: "離",
    label: "Ri · transcend",
    icon: Share2,
    title: "Share",
    body: "Publish a link or embed the form in seconds. Responses and analytics start flowing immediately.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <FadeInView className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            流れ · The flow
          </span>
          <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            守破離 — follow, break, transcend
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            The old path to mastery, applied to building a form.
          </p>
        </FadeInView>

        <StaggerView className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          {/* connecting hairline on desktop */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
          {STEPS.map(({ n, label, icon: Icon, title, body }) => (
            <StaggerViewItem key={n} className="relative">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background">
                  <span className="font-display text-2xl text-primary">{n}</span>
                </div>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <span className="mt-6 block font-mono text-xs uppercase tracking-wider text-primary">
                {label}
              </span>
              <h3 className="mt-1 text-xl font-medium">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </StaggerViewItem>
          ))}
        </StaggerView>
      </div>
    </section>
  );
}
