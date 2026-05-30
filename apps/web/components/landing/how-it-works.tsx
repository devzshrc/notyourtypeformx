"use client";

import { Sparkles, PencilLine, Share2 } from "~/components/icons";
import { FadeInView, StaggerView, StaggerViewItem } from "~/components/motion";

const STEPS = [
  {
    n: "01",
    icon: Sparkles,
    title: "Describe",
    body: "Type what you want to collect. A sentence is enough. Schema drafts the full form, fields and flow included.",
  },
  {
    n: "02",
    icon: PencilLine,
    title: "Refine",
    body: "Tweak wording, reorder questions, or add branching by asking. Every change stays in plain language.",
  },
  {
    n: "03",
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
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            From idea to live form in three moves
          </h2>
        </FadeInView>

        <StaggerView className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          {/* connecting hairline on desktop */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
          {STEPS.map(({ n, icon: Icon, title, body }) => (
            <StaggerViewItem key={n} className="relative">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="size-6" />
                </div>
                <span className="font-mono text-sm text-muted-foreground">{n}</span>
              </div>
              <h3 className="mt-6 text-xl font-medium">{title}</h3>
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
