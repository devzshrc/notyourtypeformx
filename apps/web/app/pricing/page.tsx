"use client";

import Link from "next/link";
import { CheckCircle } from "~/components/icons";
import { Button } from "~/components/ui/button";

const PLANS = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for getting started",
        features: ["5 forms", "100 responses/month", "Basic analytics", "Unlisted forms", "Email support"],
        cta: "Get Started",
        href: "/signup",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$19",
        period: "/month",
        description: "For growing teams and businesses",
        features: ["Unlimited forms", "10,000 responses/month", "Advanced analytics", "Public & unlisted forms", "Password protection", "Custom branding", "CSV export", "Priority support"],
        cta: "Start Pro Trial",
        href: "/signup",
        highlighted: true,
    },
    {
        name: "Enterprise",
        price: "$99",
        period: "/month",
        description: "For large organizations",
        features: ["Everything in Pro", "Unlimited responses", "Custom domain", "SSO / SAML", "Webhooks & API access", "SLA guarantee", "Dedicated account manager", "Custom integrations"],
        cta: "Contact Sales",
        href: "/signup",
        highlighted: false,
    },
];

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

            <main className="mx-auto max-w-5xl px-6 py-16">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h1>
                    <p className="mt-3 text-lg text-muted-foreground">Start free. Upgrade when you need more.</p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {PLANS.map((plan) => (
                        <div key={plan.name} className={`flex flex-col rounded-xl border p-6 ${plan.highlighted ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"}`}>
                            <div>
                                <h2 className="text-lg font-semibold">{plan.name}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                </div>
                            </div>
                            <ul className="mt-6 flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button asChild className="mt-6 w-full" variant={plan.highlighted ? "default" : "outline"}>
                                <Link href={plan.href}>{plan.cta}</Link>
                            </Button>
                        </div>
                    ))}
                </div>

                <p className="mt-8 text-center text-sm text-muted-foreground">All plans include SSL, 99.9% uptime, and GDPR compliance. No credit card required for free plan.</p>
            </main>
        </div>
    );
}
