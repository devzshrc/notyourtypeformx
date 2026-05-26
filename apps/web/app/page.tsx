"use client";

import Link from "next/link";
import { useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { FileText, BarChart3, Zap, Shield, Globe, Palette, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
    const { data: user, isLoading } = useUser();

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Nav */}
            <header className="border-b border-border">
                <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <span className="text-lg font-bold">ChaiForms</span>
                    <div className="flex items-center gap-3">
                        <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">Explore</Link>
                        <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
                        {!isLoading && (
                            user?.id
                                ? <Button asChild size="sm"><Link href="/dashboard">Dashboard</Link></Button>
                                : <Button asChild size="sm"><Link href="/signin">Sign In</Link></Button>
                        )}
                    </div>
                </nav>
            </header>

            {/* Hero */}
            <section className="mx-auto max-w-4xl px-6 py-20 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Build forms that people<br />actually want to fill</h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Create beautiful, conversational forms with logic jumps, analytics, and instant sharing. No code required.</p>
                <div className="mt-8 flex justify-center gap-3">
                    <Button asChild size="lg"><Link href="/signup">Get Started Free <ArrowRight className="ml-2 size-4" /></Link></Button>
                    <Button asChild variant="outline" size="lg"><Link href="/explore">Explore Templates</Link></Button>
                </div>
            </section>

            {/* Features */}
            <section className="border-t border-border bg-muted/30 py-16">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-center text-2xl font-bold">Everything you need to collect data</h2>
                    <p className="mt-2 text-center text-muted-foreground">Powerful features wrapped in a simple interface</p>
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <Feature icon={<FileText />} title="14 Field Types" desc="Text, email, rating, multiple choice, dropdowns, dates, and more." />
                        <Feature icon={<Zap />} title="Logic Jumps" desc="Show different questions based on previous answers. Build smart flows." />
                        <Feature icon={<BarChart3 />} title="Real-time Analytics" desc="Track views, starts, completions, and field-level breakdowns." />
                        <Feature icon={<Shield />} title="Password Protection" desc="Restrict access to sensitive forms with a password gate." />
                        <Feature icon={<Globe />} title="Instant Sharing" desc="Share via link, QR code, or embed. Public or unlisted visibility." />
                        <Feature icon={<Palette />} title="Templates" desc="Start from pre-built templates or share your forms publicly." />
                    </div>
                </div>
            </section>

            {/* Social proof */}
            <section className="py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl font-bold">Built for speed</h2>
                    <div className="mt-8 grid grid-cols-3 gap-6">
                        <div><p className="text-3xl font-bold text-primary">14+</p><p className="text-sm text-muted-foreground">Field types</p></div>
                        <div><p className="text-3xl font-bold text-primary">&lt;1s</p><p className="text-sm text-muted-foreground">Form load time</p></div>
                        <div><p className="text-3xl font-bold text-primary">100%</p><p className="text-sm text-muted-foreground">Type-safe APIs</p></div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-border bg-muted/30 py-16">
                <div className="mx-auto max-w-2xl px-6 text-center">
                    <h2 className="text-2xl font-bold">Ready to build better forms?</h2>
                    <p className="mt-2 text-muted-foreground">Start collecting responses in minutes. Free forever for basic use.</p>
                    <Button asChild size="lg" className="mt-6"><Link href="/signup">Create Your First Form <ArrowRight className="ml-2 size-4" /></Link></Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                    <p className="text-sm text-muted-foreground">© 2026 ChaiForms. Built with tRPC, Drizzle, and Next.js.</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <Link href="/explore" className="hover:text-foreground">Explore</Link>
                        <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
                        <Link href="http://localhost:8000/docs" target="_blank" className="hover:text-foreground">API Docs</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="rounded-lg border border-border bg-card p-5 space-y-2">
            <div className="text-primary">{icon}</div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
    );
}
