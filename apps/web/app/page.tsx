"use client";

import Link from "next/link";
import { useUser } from "~/hooks/api/auth";
import { FadeIn, FadeInView, StaggerView, StaggerViewItem, HoverLift } from "~/components/motion";
import { Button } from "~/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  MagicWand,
  Workflow,
  Gauge,
  Check,
  Star,
} from "~/components/icons";

// ─── Browser chrome wrapper for the product mock ────────────────────────────
function Frame({
  children,
  label = "schema.app",
  className = "",
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border/60 bg-card/90 shadow-2xl shadow-black/20 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-rose-400/70" />
        <span className="size-2.5 rounded-full bg-yellow-400/70" />
        <span className="size-2.5 rounded-full bg-green-400/70" />
        <span className="mx-auto rounded-md bg-background/60 px-3 py-0.5 text-[11px] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Mock: AI prompt → generated form ───────────────────────────────────────
function GeneratedFormMock() {
  const fields = [
    { q: "How would you rate Schema overall?", t: "Rating · 1–5 stars", icon: <Star className="size-3.5" /> },
    { q: "Which feature do you use most?", t: "Multiple choice · 4 options", icon: <Workflow className="size-3.5" /> },
    { q: "What almost stopped you from signing up?", t: "Long text · optional", icon: <MagicWand className="size-3.5" /> },
    { q: "Can we follow up with you?", t: "Email · validated", icon: <Check className="size-3.5" /> },
  ];
  return (
    <div className="space-y-2.5">
      {fields.map((f) => (
        <div
          key={f.q}
          className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3"
        >
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {f.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{f.q}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{f.t}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: <MagicWand className="size-5" />,
    title: "Describe it, don’t build it",
    body: "Write one sentence. Schema picks the field types, adds validation, and writes the questions.",
  },
  {
    icon: <Workflow className="size-5" />,
    title: "Logic that branches",
    body: "Conditional jumps, scoring, and hidden fields — set up in a click, no flowcharts.",
  },
  {
    icon: <Gauge className="size-5" />,
    title: "Answers in real time",
    body: "Live views, completion rate, and one-click exports. Always up to date.",
  },
];

export default function Home() {
  const { data: user, isLoading } = useUser();

  return (
    <div id="main-content" className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold tracking-tight text-transparent"
          >
            Schema
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="mr-2 hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
              Pricing
            </Link>
            {!isLoading &&
              (user?.id ? (
                <Button asChild size="sm" className="gap-1.5">
                  <Link href="/dashboard">
                    Dashboard <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/signin">Sign in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/signup">Get started</Link>
                  </Button>
                </>
              ))}
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,transparent,var(--background)_70%)]" />
        </div>

        <FadeIn className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Sparkles className="size-3.5 text-primary" />
            AI-native form builder
          </span>

          <h1 className="mx-auto mt-7 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Stop building forms.
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/55 bg-clip-text text-transparent">
              Just describe them.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            One sentence becomes a complete, conversational form — questions, validation, and logic included.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-12 gap-2 px-7 text-base shadow-lg shadow-primary/20">
              <Link href="/signup">
                Build a form free <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Product mock */}
          <div className="relative mx-auto mt-16 max-w-2xl text-left">
            <Frame label="schema.app/new">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3.5 py-3">
                <MagicWand className="size-4 shrink-0 text-primary" />
                <span className="truncate text-sm text-foreground/90">
                  Create a customer feedback form for a SaaS startup
                </span>
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                  <Sparkles className="size-3" /> Generate
                </span>
              </div>
              <div className="my-3 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <span className="h-px flex-1 bg-border/60" />
                Built in ~7 seconds
                <span className="h-px flex-1 bg-border/60" />
              </div>
              <GeneratedFormMock />
            </Frame>
          </div>
        </FadeIn>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <StaggerView className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerViewItem key={f.title}>
                <HoverLift className="h-full rounded-xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-primary/30">
                  <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </HoverLift>
              </StaggerViewItem>
            ))}
          </StaggerView>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border/60 py-24">
        <FadeInView className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your next form is one sentence away.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Describe it, let AI build it, start collecting in under a minute.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 gap-2 px-8 shadow-lg shadow-primary/20">
            <Link href="/signup">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
        </FadeInView>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 Schema</span>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
            <Link
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`}
              target="_blank"
              className="transition-colors hover:text-foreground"
            >
              API Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
