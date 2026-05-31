"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { FadeInView } from "~/components/motion";

const FAQS = [
  {
    q: "How does generating a form from a prompt work?",
    a: "You describe what you want to collect in plain language. Schema interprets it, drafts the questions, chooses sensible field types, and adds validation and branching where it makes sense. You can refine any of it by typing.",
  },
  {
    q: "Can I edit what the AI generates?",
    a: "Yes. Every generated form is fully editable. Reorder questions, rewrite copy, change field types, or add logic, either by hand or by describing the change.",
  },
  {
    q: "Where can I publish my forms?",
    a: "Share a hosted link or embed the form on any site with a snippet. Forms render natively and adapt to light and dark themes.",
  },
  {
    q: "Do I keep my data?",
    a: "Responses are yours. Export to CSV or spreadsheet anytime, and view live analytics in the dashboard.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. You can build and publish forms for free. Paid plans add higher limits, advanced logic, and team features.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-24 md:grid-cols-[0.8fr_1.2fr] md:py-32">
        <FadeInView>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            問答 · FAQ
          </span>
          <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Questions, answered
          </h2>
          <p className="mt-4 max-w-sm text-muted-foreground">
            Everything you need to know about building forms with Schema.
          </p>
        </FadeInView>

        <FadeInView>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeInView>
      </div>
    </section>
  );
}
