"use client";

import Link from "next/link";
import { ArrowRight } from "~/components/icons";
import { FadeInView } from "~/components/motion";

const TEMPLATES = [
  { title: "Product feedback", category: "Research", desc: "Score features and capture verbatim notes.", fields: 6 },
  { title: "Job application", category: "Hiring", desc: "Screen candidates with logic-gated questions.", fields: 9 },
  { title: "Event RSVP", category: "Events", desc: "Headcount, dietary needs, and session picks.", fields: 5 },
  { title: "Customer onboarding", category: "Product", desc: "Collect setup details the moment they sign up.", fields: 8 },
  { title: "Lead qualification", category: "Sales", desc: "Route hot leads with branching questions.", fields: 7 },
  { title: "Bug report", category: "Support", desc: "Structured repro steps and severity capture.", fields: 6 },
];

export function Templates() {
  return (
    <section id="templates" className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
      <FadeInView className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          雛形 · Templates
        </span>
        <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Start from a template, or your own words
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Proven starting points for the forms teams build most. Open one and
          reshape it by typing.
        </p>
      </FadeInView>

      <FadeInView className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Link
            key={t.title}
            href="/templates"
            className="group flex flex-col bg-card p-7 transition-colors hover:bg-accent/40"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.category}
            </span>
            <h3 className="font-display mt-2 text-xl font-medium tracking-tight">
              {t.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t.desc}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              {t.fields} fields
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </FadeInView>
    </section>
  );
}
