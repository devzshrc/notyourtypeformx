"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "~/components/icons";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
                    <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Schema</Link>
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm"><Link href="/signin">Sign in</Link></Button>
                        <Button asChild size="sm"><Link href="/signup">Get started</Link></Button>
                    </div>
                </nav>
            </header>

            <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">It&apos;s free. For now.</h1>
                <p className="mt-4 text-lg text-muted-foreground">All features. No limits. No credit card. Just build.</p>

                <img
                    src="https://pbs.twimg.com/media/Ehh6DtmVgAAhn9Z.jpg"
                    alt="Free for now!"
                    className="mt-10 w-full max-w-md rounded-xl"
                />

                <Button asChild size="lg" className="mt-10 h-12 gap-2 px-8 text-base">
                    <Link href="/signup">Start building for free <ArrowRight className="size-4" /></Link>
                </Button>
            </main>
        </div>
    );
}
