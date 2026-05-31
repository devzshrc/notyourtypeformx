"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowRight, Check } from "~/components/icons";
import { FadeIn, FadeInView } from "~/components/motion";

// 松竹梅 (Shō-Chiku-Bai) — the classic Japanese three-rank system.
// Pine (松) is the highest grade, bamboo (竹) the middle, plum (梅) the entry.
const TIERS = [
  {
    kanji: "梅",
    romaji: "Ume",
    gloss: "Plum — where everything begins",
    name: "Free",
    price: "₹0",
    cadence: "forever",
    features: [
      "Unlimited forms",
      "AI generation from a prompt",
      "Core field types & validation",
      "Hosted link + embed",
      "100 responses / month",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    kanji: "竹",
    romaji: "Take",
    gloss: "Bamboo — strong, flexible, growing",
    name: "Pro",
    price: "₹299",
    cadence: "per month",
    features: [
      "Everything in Ume",
      "Branching & conditional logic",
      "Live analytics & exports",
      "Custom themes & branding",
      "10,000 responses / month",
    ],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    kanji: "松",
    romaji: "Matsu",
    gloss: "Pine — the highest grade, evergreen",
    name: "Business",
    price: "₹999",
    cadence: "per month",
    features: [
      "Everything in Take",
      "Workspaces & team roles",
      "Priority AI & support",
      "Unlimited responses",
      "Audit log & SSO (soon)",
    ],
    cta: "Choose Business",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="font-display flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            <span className="sun-disc inline-block size-3.5 rounded-full" />
            Schema
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-20 md:py-28">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            松竹梅 · Pine, bamboo, plum
          </span>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Three grades, one craft
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            The old ranking of pine, bamboo, and plum — no &ldquo;lowest&rdquo; here,
            only the right fit. Start on plum and rise as you grow.
          </p>
        </FadeIn>

        <FadeInView className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.romaji}
              className={
                "relative flex flex-col rounded-lg border bg-card p-7 " +
                (t.highlighted
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border")
              }
            >
              {t.highlighted && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most chosen
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl leading-none text-primary">
                  {t.kanji}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {t.romaji}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.gloss}</p>

              <div className="mt-6 flex items-end gap-1.5">
                <span className="font-display text-4xl font-semibold tracking-tight">
                  {t.price}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  {t.cadence}
                </span>
              </div>
              <div className="mt-1 font-display text-lg">{t.name}</div>

              <ul className="mt-6 flex flex-col gap-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                variant={t.highlighted ? "default" : "outline"}
                className="mt-8 h-11 w-full gap-2"
              >
                <Link href="/signup">
                  {t.cta} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          ))}
        </FadeInView>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Prices shown are placeholders pending launch. No credit card required to start.
        </p>
      </main>
    </div>
  );
}
