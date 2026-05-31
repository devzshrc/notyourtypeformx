"use client";

import { FadeInView } from "~/components/motion";

/**
 * Editorial stat strip — a vermilion lead block followed by capability figures
 * divided by hairlines. These are product truths (what the builder does), not
 * fabricated social-proof metrics.
 */
const STATS = [
  { value: "0", label: "Lines of code" },
  { value: "1", label: "Sentence to a form" },
  { value: "~30s", label: "Idea to published" },
  { value: "100%", label: "Editable output" },
];

export function StatStrip() {
  return (
    <section className="mx-auto max-w-[1200px] px-6">
      <FadeInView className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-5">
        {/* vermilion lead block */}
        <div className="col-span-2 flex flex-col justify-center bg-primary px-7 py-8 text-primary-foreground md:col-span-1">
          <div className="font-display text-3xl font-semibold leading-none md:text-4xl">
            Describe.
          </div>
          <div className="mt-2 text-sm text-primary-foreground/80">
            Ship the form.
          </div>
        </div>

        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col justify-center bg-card px-7 py-8"
          >
            <div className="font-display text-3xl font-semibold leading-none tracking-tight md:text-4xl">
              {s.value}
            </div>
            <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </FadeInView>
    </section>
  );
}
