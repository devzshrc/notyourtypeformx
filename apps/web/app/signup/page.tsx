"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSignup, useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowRight, CheckCircle } from "~/components/icons";
import {
    motion,
    AnimatePresence,
    SlideIn,
    StaggerList,
    StaggerItem,
    ScaleTap,
    useReducedMotion,
    type Variants,
} from "~/components/motion";
import type { CSSProperties } from "react";

// ─── Module-level variants ────────────────────────────────────────────────────
const perkVariants: Variants = {
    hidden:  { opacity: 0, x: -12 },
    visible: (i: number) => ({
        opacity: 1, x: 0,
        transition: { type: "spring", stiffness: 300, damping: 28, delay: 0.4 + i * 0.07 },
    }),
};

const checkVariants: Variants = {
    hidden:  { scale: 0.95, opacity: 0 },
    visible: (i: number) => ({
        scale: 1, opacity: 1,
        transition: { type: "spring", stiffness: 400, damping: 20, delay: 0.45 + i * 0.07 },
    }),
};

const errorVariants: Variants = {
    hidden:  { opacity: 0, y: -6, height: 0 },
    visible: { opacity: 1, y: 0, height: "auto", transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit:    { opacity: 0, y: -4, height: 0, transition: { duration: 0.15 } },
};

const WC_OPACITY_TRANSFORM: CSSProperties = { willChange: "opacity, transform" };

const PERKS = [
    "AI-powered form generation",
    "14+ field types with logic jumps",
    "Real-time analytics & exports",
    "4 beautiful form themes",
    "Free forever for basic use",
];

export default function SignupPage() {
    return (
        <Suspense>
            <SignupContent />
        </Suspense>
    );
}

function SignupContent() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { createUserWithEmailAndPasswordAsync, error, isPending } = useSignup();
    const { data: user, isLoading } = useUser();
    const shouldReduce = useReducedMotion();

    useEffect(() => { if (!isLoading && user?.id) router.push("/dashboard"); }, [isLoading, user, router]);

    if (!isLoading && user?.id) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPasswordAsync({ fullName, email, password });
            const redirect = searchParams.get("redirect");
            router.push(redirect && redirect.startsWith("/") ? redirect : "/dashboard");
        } catch { /* error shown inline */ }
    };

    return (
        <main className="flex min-h-screen bg-background">
            {/* Left panel */}
            <SlideIn direction="left" className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary/5 p-12 lg:flex">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
                {!shouldReduce && (
                    <>
                        <motion.div
                            animate={{ scale: [1, 1.07, 1], opacity: [0.08, 0.13, 0.08] }}
                            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                            style={{ willChange: "transform, opacity" }}
                            className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-primary blur-3xl"
                        />
                        <motion.div
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            style={{ willChange: "transform" }}
                            className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-violet-500/10 blur-3xl"
                        />
                    </>
                )}
                <Link href="/" className="relative z-10">
                    <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Schema
                    </span>
                </Link>
                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Everything you need to collect data beautifully</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Join developers and teams building better forms.</p>
                    </div>
                    <ul className="space-y-3">
                        {PERKS.map((perk, i) => (
                            <motion.li
                                key={perk}
                                custom={i}
                                variants={perkVariants}
                                initial="hidden"
                                animate="visible"
                                style={WC_OPACITY_TRANSFORM}
                                className="flex items-center gap-3 text-sm"
                            >
                                <motion.div custom={i} variants={checkVariants} initial="hidden" animate="visible" style={WC_OPACITY_TRANSFORM}>
                                    <CheckCircle className="size-4 shrink-0 text-primary" />
                                </motion.div>
                                <span className="text-foreground/80">{perk}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </SlideIn>

            {/* Right panel */}
            <SlideIn direction="right" className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent lg:hidden">
                            Schema
                        </Link>
                        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Create your account</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Get started with Schema — free forever</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <StaggerList className="space-y-5">
                            <StaggerItem>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full name</Label>
                                    <Input id="fullName" type="text" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="h-11" />
                                </div>
                            </StaggerItem>
                            <StaggerItem>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11" />
                                </div>
                            </StaggerItem>
                            <StaggerItem>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11" />
                                </div>
                            </StaggerItem>
                            <StaggerItem>
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            key="error"
                                            variants={errorVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            style={WC_OPACITY_TRANSFORM}
                                            className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
                                        >
                                            <p className="text-sm text-destructive" role="alert">{error.message}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </StaggerItem>
                            <StaggerItem>
                                <ScaleTap>
                                    <Button type="submit" className="h-11 w-full gap-2" disabled={isPending}>
                                        {isPending ? "Creating account…" : <>Create account <ArrowRight className="size-3.5" /></>}
                                    </Button>
                                </ScaleTap>
                            </StaggerItem>
                        </StaggerList>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/signin" className="font-medium text-primary hover:underline">Sign in</Link>
                    </p>
                </div>
            </SlideIn>
        </main>
    );
}
