"use client";

import Link from "next/link";
import { useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { FileText, BarChart3, Zap, Shield, Globe, Palette, ArrowRight, CheckCircle, Sparkles } from "~/components/icons";
import {
    motion,
    AnimatePresence,
    FadeIn,
    FadeInView,
    StaggerView,
    StaggerViewItem,
    ScaleTap,
    HoverLift,
    useReducedMotion,
    type Variants,
} from "~/components/motion";
import { useMemo, type CSSProperties } from "react";

// ─── Module-level variants ────────────────────────────────────────────────────

const navVariants: Variants = {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] } },
};

const heroTextVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const heroWordVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 20, delay: 0.05 } },
};

const heroCTAVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.45 } },
};

const heroCTAItemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

const cardHoverVariants: Variants = {
    rest: { y: 0, boxShadow: "0 0 0 0 transparent" },
    hover: { y: -4, boxShadow: "0 8px 30px -4px hsl(var(--primary) / 0.12)", transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const iconHoverVariants: Variants = {
    rest: { scale: 1, rotate: 0 },
    hover: { scale: 1.12, rotate: -6, transition: { type: "spring", stiffness: 400, damping: 17 } },
};

// ─── Static style objects ─────────────────────────────────────────────────────
const WC_TRANSFORM: CSSProperties = { willChange: "transform" };
const WC_OPACITY_TRANSFORM: CSSProperties = { willChange: "opacity, transform" };

// ─── Hero word-by-word component ──────────────────────────────────────────────
function AnimatedWords({ text, className = "" }: { text: string; className?: string }) {
    const shouldReduce = useReducedMotion();
    const words = useMemo(() => text.split(" "), [text]);

    if (shouldReduce) return <span className={className}>{text}</span>;

    return (
        <motion.span
            variants={heroTextVariants}
            initial="hidden"
            animate="visible"
            className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`}
        >
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    variants={heroWordVariants}
                    style={WC_OPACITY_TRANSFORM}
                    className="inline-block"
                >
                    {word}
                </motion.span>
            ))}
        </motion.span>
    );
}

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
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial="rest"
            whileHover={shouldReduce ? "rest" : "hover"}
            animate="rest"
            variants={cardHoverVariants}
            style={WC_TRANSFORM}
            className="group rounded-xl border border-border/60 bg-card p-6 cursor-default"
        >
            <motion.div
                variants={iconHoverVariants}
                style={WC_TRANSFORM}
                className={`mb-4 inline-flex size-10 items-center justify-center rounded-lg ${bg} ${color}`}
            >
                {icon}
            </motion.div>
            <h3 className="font-semibold tracking-tight">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
    const { data: user, isLoading } = useUser();
    const shouldReduce = useReducedMotion();

    const FEATURES = useMemo(() => [
        { icon: <FileText className="size-5" />, color: "text-blue-500",   bg: "bg-blue-500/10",   title: "14 Field Types",       desc: "Text, email, rating, multiple choice, dropdowns, dates, file uploads, and more." },
        { icon: <Zap       className="size-5" />, color: "text-yellow-500", bg: "bg-yellow-500/10", title: "Logic Jumps",           desc: "Show different questions based on previous answers. Build smart, branching flows." },
        { icon: <BarChart3 className="size-5" />, color: "text-green-500",  bg: "bg-green-500/10",  title: "Real-time Analytics",   desc: "Track views, starts, completions, and field-level response breakdowns live." },
        { icon: <Sparkles  className="size-5" />, color: "text-purple-500", bg: "bg-purple-500/10", title: "AI Form Generation",    desc: "Describe your form in plain English — AI creates all fields, options, and structure." },
        { icon: <Shield    className="size-5" />, color: "text-rose-500",   bg: "bg-rose-500/10",   title: "Password Protection",   desc: "Restrict access to sensitive forms with a password gate and response limits." },
        { icon: <Palette   className="size-5" />, color: "text-orange-500", bg: "bg-orange-500/10", title: "4 Premium Themes",      desc: "Bold Tech, T3 Chat, Starry Night, Retro Arcade — each form can have its own style." },
    ], []);

    const PERKS = useMemo(() => [
        "Conversational one-question-at-a-time flow",
        "AI generation + per-field AI label improvement",
        "Logic jumps, scoring, and conditional visibility",
        "Analytics with time-series charts + field summaries",
        "4 per-form visual themes with dark mode",
        "Export to CSV or Excel in one click",
    ], []);

    return (
        <div id="main-content" className="min-h-screen bg-background text-foreground overflow-x-hidden">

            {/* ── Nav ── */}
            <motion.header
                variants={navVariants}
                initial="hidden"
                animate="visible"
                style={WC_OPACITY_TRANSFORM}
                className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
            >
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
                    <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Schema
                    </Link>
                    <div className="hidden items-center gap-6 text-sm sm:flex">
                        {["Pricing"].map((label) => (
                            <Link
                                key={label}
                                href={`/${label.toLowerCase()}`}
                                className="relative text-muted-foreground transition-colors hover:text-foreground group"
                            >
                                {label}
                                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-200 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <AnimatePresence mode="popLayout">
                            {!isLoading && (
                                user?.id ? (
                                    <motion.div
                                        key="dashboard"
                                        initial={{ opacity: 0, scale: 0.92 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.92 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        style={WC_OPACITY_TRANSFORM}
                                    >
                                        <ScaleTap>
                                            <Button asChild size="sm" className="gap-1.5">
                                                <Link href="/dashboard">Dashboard <ArrowRight className="size-3.5" /></Link>
                                            </Button>
                                        </ScaleTap>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="auth"
                                        initial={{ opacity: 0, scale: 0.92 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.92 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        style={WC_OPACITY_TRANSFORM}
                                        className="flex items-center gap-2"
                                    >
                                        <ScaleTap>
                                            <Button asChild variant="ghost" size="sm"><Link href="/signin">Sign in</Link></Button>
                                        </ScaleTap>
                                        <ScaleTap>
                                            <Button asChild size="sm"><Link href="/signup">Get started</Link></Button>
                                        </ScaleTap>
                                    </motion.div>
                                )
                            )}
                        </AnimatePresence>
                    </div>
                </nav>
            </motion.header>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                {/* Background orbs */}
                {!shouldReduce && (
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.07, 0.12, 0.07] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            style={{ willChange: "transform, opacity" }}
                            className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary blur-3xl"
                        />
                        <motion.div
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            style={WC_TRANSFORM}
                            className="absolute -right-24 top-16 h-64 w-64 rounded-full bg-primary/5 blur-2xl"
                        />
                    </div>
                )}

                <div className="mx-auto max-w-4xl px-6 pb-24 pt-20 text-center">
                    {/* Badge */}
                    <FadeIn delay={0.05}>
                        <motion.div
                            variants={badgeVariants}
                            initial="hidden"
                            animate="visible"
                            style={WC_OPACITY_TRANSFORM}
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
                        >
                            <Sparkles className="size-3.5" /> AI-powered form builder
                        </motion.div>
                    </FadeIn>

                    {/* Headline */}
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
                        <AnimatedWords text="Build forms people" />
                        {" "}
                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            <AnimatedWords text="actually love" />
                        </span>
                    </h1>

                    <FadeIn delay={0.42}>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                            Create beautiful conversational forms with AI, logic jumps, real-time analytics,
                            and instant sharing — in minutes, not hours.
                        </p>
                    </FadeIn>

                    {/* CTAs */}
                    <motion.div
                        variants={heroCTAVariants}
                        initial="hidden"
                        animate="visible"
                        className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
                    >
                        <motion.div variants={heroCTAItemVariants} style={WC_OPACITY_TRANSFORM}>
                            <ScaleTap>
                                <Button asChild size="lg" className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/20">
                                    <Link href="/signup">Start building free <ArrowRight className="size-4" /></Link>
                                </Button>
                            </ScaleTap>
                        </motion.div>
                        <motion.div variants={heroCTAItemVariants} style={WC_OPACITY_TRANSFORM}>
                            <ScaleTap>
                                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                                    <Link href="/pricing">See pricing</Link>
                                </Button>
                            </ScaleTap>
                        </motion.div>
                    </motion.div>

                    <FadeIn delay={0.6}>
                        <p className="mt-4 text-xs text-muted-foreground/80">No credit card required · Free forever for basic use</p>
                    </FadeIn>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="border-t border-border/60 py-24">
                <div className="mx-auto max-w-6xl px-6">
                    <FadeInView className="mb-14 text-center">
                        <p className="text-sm font-medium uppercase tracking-widest text-primary">Features</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to collect data</h2>
                        <p className="mt-3 text-muted-foreground">Powerful features wrapped in a simple, delightful interface</p>
                    </FadeInView>

                    <StaggerView className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f) => (
                            <StaggerViewItem key={f.title}>
                                <Feature {...f} />
                            </StaggerViewItem>
                        ))}
                    </StaggerView>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="border-t border-border/60 py-24 bg-card/30">
                <div className="mx-auto max-w-5xl px-6">
                    <StaggerView className="grid grid-cols-3 gap-8 text-center">
                        {[
                            { value: "14+", label: "Field types" },
                            { value: "100%", label: "Type-safe APIs" },
                            { value: "4", label: "Premium themes" },
                        ].map((s) => (
                            <StaggerViewItem key={s.label}>
                                <HoverLift amount={-3}>
                                    <p className="text-4xl font-bold tracking-tight text-primary">{s.value}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                                </HoverLift>
                            </StaggerViewItem>
                        ))}
                    </StaggerView>
                </div>
            </section>

            {/* ── Why ── */}
            <section className="border-t border-border/60 py-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <FadeInView>
                            <p className="text-sm font-medium uppercase tracking-widest text-primary">Why Schema</p>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Not just another form builder</h2>
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                                Schema is a full-stack, type-safe form platform built for developers and power users who want Typeform-level UX without the Typeform price tag.
                            </p>
                        </FadeInView>
                        <StaggerView className="flex flex-col gap-3">
                            {PERKS.map((perk) => (
                                <StaggerViewItem key={perk}>
                                    <motion.div
                                        initial="rest"
                                        whileHover={shouldReduce ? "rest" : "hover"}
                                        variants={{
                                            rest: { x: 0 },
                                            hover: { x: 4, transition: { type: "spring", stiffness: 400, damping: 25 } },
                                        }}
                                        style={WC_TRANSFORM}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                                        <span className="text-sm text-muted-foreground">{perk}</span>
                                    </motion.div>
                                </StaggerViewItem>
                            ))}
                        </StaggerView>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="border-t border-border/60 py-24 bg-card/30">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <FadeInView>
                        <motion.div
                            initial="rest"
                            whileHover={shouldReduce ? "rest" : { scale: 1.008, transition: { type: "spring", stiffness: 300, damping: 30 } }}
                            style={WC_TRANSFORM}
                            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-12"
                        >
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                            <div className="relative">
                                <h2 className="text-3xl font-bold tracking-tight">Ready to build better forms?</h2>
                                <p className="mt-3 text-muted-foreground">Start collecting responses in minutes. No code required.</p>
                                <div className="mt-8">
                                    <ScaleTap>
                                        <Button asChild size="lg" className="h-12 gap-2 px-8 shadow-lg shadow-primary/20">
                                            <Link href="/signup">Create your first form <ArrowRight className="size-4" /></Link>
                                        </Button>
                                    </ScaleTap>
                                </div>
                                <p className="mt-4 text-xs text-muted-foreground/80">Free to start · No credit card needed</p>
                            </div>
                        </motion.div>
                    </FadeInView>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-border/60 py-10">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                    <span className="text-sm text-muted-foreground">© 2026 Schema. Built with tRPC, Drizzle &amp; Next.js.</span>
                    <div className="flex items-center gap-5 text-sm text-muted-foreground">
                        {[
                            { label: "Pricing", href: "/pricing" },
                            { label: "API Docs", href: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`, target: "_blank" },
                        ].map((l) => (
                            <motion.div
                                key={l.label}
                                whileHover={shouldReduce ? {} : { y: -1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                style={WC_TRANSFORM}
                            >
                                <Link href={l.href} target={l.target} className="transition-colors hover:text-foreground">
                                    {l.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
