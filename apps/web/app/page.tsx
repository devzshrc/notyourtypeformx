"use client";

import Link from "next/link";
import { useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import {
  FileText,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Palette,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "~/components/icons";

// ─── Feature card ─────────────────────────────────────────────────────────────
function Feature({
  icon,
  color,
  bg,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  bg: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group flex h-full flex-col rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 transition-shadow hover:shadow-md">
      <div className={`mb-4 inline-flex size-10 items-center justify-center rounded-lg ${bg} ${color}`}>
        {icon}
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const { data: user, isLoading } = useUser();

  const FEATURES = [
    {
      icon: <FileText className="size-5" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      title: "14 Field Types",
      desc: "Text, email, rating, multiple choice, dropdowns, dates, phone, website — every input you need.",
    },
    {
      icon: <Zap className="size-5" />,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      title: "Logic Jumps",
      desc: "Branch your form based on answers. Show the right questions to the right people.",
    },
    {
      icon: <BarChart3 className="size-5" />,
      color: "text-green-500",
      bg: "bg-green-500/10",
      title: "Real-time Analytics",
      desc: "Live dashboards with views, completions, drop-offs, and per-field response breakdowns.",
    },
    {
      icon: <Sparkles className="size-5" />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      title: "AI Generation",
      desc: "Describe what you need in plain English — AI builds the entire form structure for you.",
    },
    {
      icon: <Shield className="size-5" />,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      title: "Access Controls",
      desc: "Password protection, response limits, expiry dates, and public/unlisted visibility.",
    },
    {
      icon: <Palette className="size-5" />,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      title: "23 Creative Themes",
      desc: "From Cyberpunk Tokyo to Phir Hera Pheri — each form gets its own visual identity with background images.",
    },
    {
      icon: <Globe className="size-5" />,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      title: "Instant Sharing",
      desc: "One-click publish with shareable links, QR codes, and custom redirect URLs after submission.",
    },
    {
      icon: <Zap className="size-5" />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      title: "Drag & Drop Builder",
      desc: "Reorder fields by dragging them. Inline editing, duplicate, and AI-powered label improvements.",
    },
    {
      icon: <FileText className="size-5" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      title: "Export Anywhere",
      desc: "Download responses as CSV or Excel. Bulk import questions from spreadsheets.",
    },
  ];

  const PERKS = [
    "Conversational one-question-at-a-time experience",
    "AI generates full forms from a single sentence",
    "Drag & drop reordering with inline field editing",
    "Logic jumps, scoring, and conditional branching",
    "23 creative themes — movies, anime, dev, memes & more",
    "Real-time analytics with time-series charts",
    "Password protection, expiry dates & response caps",
    "Export responses to CSV or Excel instantly",
    "QR codes and custom post-submission redirects",
    "Dark mode support across all themes",
  ];

  return (
    <div id="main-content" className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Schema
          </Link>
          <div className="hidden items-center gap-6 text-sm sm:flex">
            <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {!isLoading && (user?.id ? (
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/dashboard">Dashboard <ArrowRight className="size-3.5" /></Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm"><Link href="/signin">Sign in</Link></Button>
                <Button asChild size="sm"><Link href="/signup">Get started</Link></Button>
              </div>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6 pb-24 pt-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
            Not your regular{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              form tool.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Create beautiful conversational forms with AI, logic jumps, real-time analytics, and
            instant sharing — in minutes, not hours.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/20">
              <Link href="/signup">Start building free <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground/80">
            No credit card required · Free forever for basic use
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.9985 47.9994H0V8.61853e-07H47.9985V47.9994Z" fill="#FF6600" />
              <path d="M13.9012 11.7843H17.6595L22.4961 21.5325C23.203 22.9836 23.7984 24.3976 23.7984 24.3976C23.7984 24.3976 24.4313 23.021 25.175 21.5325L30.0868 11.7843H33.5843L25.2865 27.3746V37.309H22.1244V27.1884L13.9012 11.7843Z" fill="white" />
            </svg>
            <span className="text-xs text-muted-foreground">Not backed by YC</span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative border-t border-border/60 py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Features</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to collect data
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Powerful features wrapped in a simple, delightful interface.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Feature key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative border-t border-border/60 py-24 bg-card/30">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "14+", label: "Field types" },
              { value: "23", label: "Creative themes" },
              { value: "∞", label: "Free responses" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold tracking-tight bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section className="relative border-t border-border/60 py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-primary">Why Schema</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Not just another form builder
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Schema is a full-stack, type-safe form platform built for developers and power users
                who want Typeform-level UX without the Typeform price tag.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative border-t border-border/60 py-24 bg-card/30">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight">Ready to build better forms?</h2>
              <p className="mt-3 text-muted-foreground">
                Start collecting responses in minutes. No code required.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="h-12 gap-2 px-8 shadow-lg shadow-primary/20">
                  <Link href="/signup">Create your first form <ArrowRight className="size-4" /></Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground/80">
                Free to start · No credit card needed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span className="text-sm text-muted-foreground">
            © 2026 Schema. Built with tRPC, Drizzle &amp; Next.js.
          </span>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
            <Link href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`} target="_blank" className="transition-colors hover:text-foreground">API Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
