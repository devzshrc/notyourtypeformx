"use client";

import { Carousel, Card } from "~/components/ui/apple-cards-carousel";
import { FadeInView } from "~/components/motion";

const TEMPLATES = [
  { title: "Product feedback", category: "Research", desc: "Score features and capture verbatim notes.", seed: "feedback-survey", fields: 6 },
  { title: "Job application", category: "Hiring", desc: "Screen candidates with logic-gated questions.", seed: "office-hiring", fields: 9 },
  { title: "Event RSVP", category: "Events", desc: "Headcount, dietary needs, and session picks.", seed: "event-rsvp", fields: 5 },
  { title: "Customer onboarding", category: "Product", desc: "Collect setup details the moment they sign up.", seed: "onboarding-flow", fields: 8 },
  { title: "Lead qualification", category: "Sales", desc: "Route hot leads with branching questions.", seed: "sales-leads", fields: 7 },
  { title: "Bug report", category: "Support", desc: "Structured repro steps and severity capture.", seed: "bug-report", fields: 6 },
];

function TemplateContent({ desc, fields }: { desc: string; fields: number }) {
  return (
    <div className="rounded-2xl bg-muted/50 p-6 md:p-10">
      <p className="max-w-2xl text-base text-foreground md:text-lg">{desc}</p>
      <p className="mt-4 font-mono text-sm text-muted-foreground">
        {fields} fields, fully editable. Open it and reshape it by typing.
      </p>
    </div>
  );
}

export function Templates() {
  const cards = TEMPLATES.map((t, i) => (
    <Card
      key={t.seed}
      index={i}
      card={{
        src: `https://picsum.photos/seed/${t.seed}/800/1000?grayscale`,
        title: t.title,
        category: t.category,
        content: <TemplateContent desc={t.desc} fields={t.fields} />,
      }}
    />
  ));

  return (
    <section id="templates" className="py-24 md:py-32">
      <FadeInView className="mx-auto max-w-[1200px] px-6">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Start from a template, or your own words
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Proven starting points for the forms teams build most. Open one and
          reshape it by typing.
        </p>
      </FadeInView>

      <Carousel items={cards} />
    </section>
  );
}
