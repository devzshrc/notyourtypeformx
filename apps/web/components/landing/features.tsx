"use client";

import {
  MagicWand,
  MessageSquare,
  GitBranch,
  BarChart3,
  Code2,
  Shield,
} from "~/components/icons";
import { FadeInView } from "~/components/motion";

const ITEMS = [
  {
    icon: MagicWand,
    title: "Generate from a prompt",
    description:
      "Describe the form in plain language. Schema writes the questions, picks field types, and wires the logic.",
  },
  {
    icon: MessageSquare,
    title: "Conversational by default",
    description: "One question at a time, a flow that feels like a chat.",
  },
  {
    icon: GitBranch,
    title: "Branching logic",
    description: "Route questions based on earlier answers. No flowchart builder.",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    description: "Completion, drop-off, and per-question insight as responses land.",
  },
  {
    icon: Code2,
    title: "Embed anywhere",
    description: "Drop a snippet into any site, or share a hosted link.",
  },
  {
    icon: Shield,
    title: "Validation built in",
    description: "Email, ranges, required fields, and custom rules on every form.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
      <FadeInView className="max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          道具 · The kit
        </span>
        <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Everything you need,
          <br />
          nothing you don&apos;t.
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Schema handles the tedious parts of form building so you can ship in
          minutes, not afternoons.
        </p>
      </FadeInView>

      {/* hairline-ruled editorial grid */}
      <FadeInView className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group flex flex-col gap-3 bg-card p-7 transition-colors hover:bg-accent/40"
          >
            <div className="flex size-10 items-center justify-center rounded-md border border-border bg-background text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="font-display mt-1 text-xl font-medium tracking-tight">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </FadeInView>
    </section>
  );
}
