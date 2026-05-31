"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSignin, useUser, safeRedirect, markSession } from "~/hooks/api/auth";
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

    // Already-/just-authenticated → honor ?redirect (e.g. /invite/{token}), not a hardcoded
    // /dashboard. Must match the post-login redirect in handleSubmit, otherwise this effect
    // races and clobbers an invite redirect.
    //
    // Reaching this page while already authenticated means the JWT is valid but the
    // has_session marker is gone (dev restart, cleared cookie, or a failed markSession at
    // login). Without re-setting the marker, middleware bounces /dashboard straight back to
    // /signin → infinite loop. Re-mark, then redirect.
    useEffect(() => {
        if (isLoading || !user?.id) return;
        let cancelled = false;
        void markSession().finally(() => {
            if (!cancelled) router.replace(safeRedirect(searchParams.get("redirect")));
        });
        return () => { cancelled = true; };
    }, [isLoading, user, router, searchParams]);

    if (!isLoading && user?.id) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signInUserWithEmailAndPasswordAsync({ email, password });
            router.replace(safeRedirect(searchParams.get("redirect")));
        } catch { /* error shown inline */ }
    };

    return (
        <main className="flex min-h-[100dvh] bg-background">
            {/* Left panel — Japan photography under an ink wash */}
            <SlideIn direction="left" className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
                <Image
                    src="/landing/auth-signin-v2.jpg"
                    alt="Japan"
                    fill
                    priority
                    sizes="50vw"
                    className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
                <Link href="/" className="relative z-10">
                    <span className="font-display flex items-center gap-2 text-2xl font-semibold tracking-tight text-white">
                        <span className="sun-disc inline-block size-3.5 rounded-full" />
                        Schema
                    </span>
                </Link>
                <div className="relative z-10 space-y-4">
                    <blockquote className="font-display text-2xl font-medium leading-snug text-white">
                        &ldquo;Build forms that people actually want to fill.&rdquo;
                    </blockquote>
                    <p className="text-sm text-white/70">AI-powered, beautiful themes, real-time analytics</p>
                </div>
            </SlideIn>

            {/* Right panel */}
            <SlideIn direction="right" className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <Link href="/" className="text-xl font-semibold tracking-tight lg:hidden">
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
