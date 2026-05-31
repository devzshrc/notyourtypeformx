"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";

// Error boundary — 七転び八起き (fall seven, rise eight). Daruma always rights itself.
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center text-foreground">
            {/* Daruma (達磨) — the roly-poly that always rises */}
            <div className="hanko flex size-20 items-center justify-center rounded-full text-3xl text-white shadow-lg">
                <span className="font-display leading-none">起</span>
            </div>
            <h1 className="font-display mt-6 text-2xl font-semibold tracking-tight">
                Something tipped over
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                七転び八起き — fall seven times, rise eight. An error happened, but
                nothing is lost. Try again.
            </p>
            <div className="mt-8 flex gap-3">
                <Button size="lg" className="h-11 px-7" onClick={reset}>
                    Try again
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 px-7">
                    <a href="/">Return home</a>
                </Button>
            </div>
        </main>
    );
}
