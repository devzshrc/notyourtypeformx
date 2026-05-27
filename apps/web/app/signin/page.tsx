"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSignin, useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowRight } from "~/components/icons";
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
const errorVariants: Variants = {
    hidden:  { opacity: 0, y: -6, height: 0 },
    visible: { opacity: 1, y: 0, height: "auto", transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit:    { opacity: 0, y: -4, height: 0, transition: { duration: 0.15 } },
};

const WC_OPACITY_TRANSFORM: CSSProperties = { willChange: "opacity, transform" };

export default function SigninPage() {
    return (
        <Suspense>
            <SigninContent />
        </Suspense>
    );
}

function SigninContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signInUserWithEmailAndPasswordAsync, error, isPending } = useSignin();
    const { data: user, isLoading } = useUser();
    const shouldReduce = useReducedMotion();

    useEffect(() => { if (!isLoading && user?.id) router.push("/dashboard"); }, [isLoading, user, router]);

    if (!isLoading && user?.id) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signInUserWithEmailAndPasswordAsync({ email, password });
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
                            animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
                            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                            style={{ willChange: "transform, opacity" }}
                            className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-primary blur-3xl"
                        />
                        <motion.div
                            animate={{ y: [0, -14, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
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
                <div className="relative z-10 space-y-4">
                    <blockquote className="text-lg font-medium leading-relaxed text-foreground/80">
                        "Build forms that people actually want to fill."
                    </blockquote>
                    <p className="text-sm text-muted-foreground">AI-powered · Beautiful themes · Real-time analytics</p>
                </div>
            </SlideIn>

            {/* Right panel */}
            <SlideIn direction="right" className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent lg:hidden">
                            Schema
                        </Link>
                        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Welcome back</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <StaggerList className="space-y-5">
                            <StaggerItem>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11" />
                                </div>
                            </StaggerItem>
                            <StaggerItem>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11" />
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
                                        {isPending ? "Signing in…" : <>Sign in <ArrowRight className="size-3.5" /></>}
                                    </Button>
                                </ScaleTap>
                            </StaggerItem>
                        </StaggerList>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-medium text-primary hover:underline">Create one free</Link>
                    </p>
                </div>
            </SlideIn>
        </main>
    );
}
