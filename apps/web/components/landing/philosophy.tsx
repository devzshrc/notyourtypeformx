"use client";

import { FadeInView, StaggerView, StaggerViewItem } from "~/components/motion";

/**
 * Philosophy section — four Japanese design principles, each mapped to a real
 * product value. Showcase, not decoration: the form builder genuinely embodies
 * these ideas (one question at a time, no clutter, iterate on data, respect the
 * respondent).
 */
const PRINCIPLES = [
  {
    kanji: "間",
    romaji: "Ma",
    en: "The space between",
    body: "One question at a time, with room to think. A form should breathe, not crowd.",
  },
  {
    kanji: "侘寂",
    romaji: "Wabi-sabi",
    en: "Beauty in restraint",
    body: "Only what the form needs — nothing ornamental. Quiet, plain, finished.",
  },
  {
    kanji: "改善",
    romaji: "Kaizen",
    en: "Continuous improvement",
    body: "Live analytics turn every response into a reason to refine. Small steps, always.",
  },
  {
    kanji: "おもてなし",
    romaji: "Omotenashi",
    en: "Wholehearted care",
    body: "A form is hospitality. Schema crafts ones people feel respected filling out.",
  },
];

export function Philosophy() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <FadeInView className="max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            思想 · The philosophy
          </span>
          <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Built on four old ideas
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Schema borrows from Japanese craft — not as decoration, but as how the
            product actually behaves.
          </p>
        </FadeInView>

        <StaggerView className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <StaggerViewItem
              key={p.romaji}
              className="flex flex-col gap-4 bg-card p-7"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl leading-none text-primary">
                  {p.kanji}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {p.romaji}
                </span>
              </div>
              <h3 className="font-display text-xl font-medium tracking-tight">
                {p.en}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </StaggerViewItem>
          ))}
        </StaggerView>
      </div>
    </section>
  );
}
