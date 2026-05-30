"use client";

import {
  MagicWand,
  MessageSquare,
  GitBranch,
  BarChart3,
  Code2,
  Shield,
} from "~/components/icons";
import { BentoGrid, BentoGridItem } from "~/components/ui/bento-grid";
import { FadeInView } from "~/components/motion";

/* Monochrome header visuals so the bento has real variation, not text-on-card */
function HeaderDots() {
  return (
    <div className="bg-dot-grid relative h-full min-h-24 w-full rounded-xl border border-border bg-muted/40 text-foreground/[0.08]">
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" />
    </div>
  );
}

function HeaderPrompt() {
  return (
    <div className="flex h-full min-h-24 w-full flex-col justify-center gap-2 rounded-xl border border-border bg-muted/40 p-4">
      <div className="h-2.5 w-4/5 rounded-full bg-foreground/15" />
      <div className="h-2.5 w-3/5 rounded-full bg-foreground/10" />
      <div className="mt-1 inline-flex w-fit rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background">
        Generate
      </div>
    </div>
  );
}

function HeaderBars() {
  const bars = [40, 70, 55, 90, 65];
  return (
    <div className="flex h-full min-h-24 w-full items-end gap-2 rounded-xl border border-border bg-muted/40 p-4">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-foreground/20"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

const ITEMS = [
  {
    icon: <MagicWand className="size-5" />,
    title: "Generate from a prompt",
    description:
      "Describe the form in plain language. Schema writes the questions, picks field types, and wires the logic.",
    header: <HeaderPrompt />,
    className: "md:col-span-2",
  },
  {
    icon: <MessageSquare className="size-5" />,
    title: "Conversational by default",
    description: "One question at a time, a flow that feels like a chat.",
    header: <HeaderDots />,
    className: "",
  },
  {
    icon: <GitBranch className="size-5" />,
    title: "Branching logic",
    description: "Route questions based on earlier answers. No flowchart builder.",
    header: <HeaderDots />,
    className: "",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "Live analytics",
    description: "Completion, drop-off, and per-question insight as responses land.",
    header: <HeaderBars />,
    className: "md:col-span-2",
  },
  {
    icon: <Code2 className="size-5" />,
    title: "Embed anywhere",
    description: "Drop a snippet into any site, or share a link.",
    header: <HeaderDots />,
    className: "",
  },
  {
    icon: <Shield className="size-5" />,
    title: "Validation built in",
    description:
      "Email, ranges, required fields, and custom rules generated for every form.",
    header: <HeaderDots />,
    className: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
      <FadeInView className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Everything a form needs, written for you
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Schema handles the tedious parts of form building so you can ship in
          minutes, not afternoons.
        </p>
      </FadeInView>

      <FadeInView>
        <BentoGrid className="mx-0 mt-12 max-w-none md:auto-rows-[16rem]">
          {ITEMS.map((item) => (
            <BentoGridItem
              key={item.title}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </FadeInView>
    </section>
  );
}
