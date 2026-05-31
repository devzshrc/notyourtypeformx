import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "~/components/icons";

// 404 — themed on 七転び八起き (fall seven, rise eight): a wrong turn, not an end.
export default function NotFound() {
    return (
        <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-background px-6 text-center text-foreground">
            {/* 枯山水 — raked sand garden */}
            <div aria-hidden className="zen-sand pointer-events-none absolute inset-0 text-foreground/[0.06]" />
            <div className="relative z-10 flex flex-col items-center">
                <span className="font-display text-7xl font-semibold tracking-tight text-primary md:text-8xl">
                    四〇四
                </span>
                <h1 className="font-display mt-4 text-2xl font-semibold tracking-tight">
                    This path leads nowhere
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    七転び八起き — fall seven times, rise eight. A missing page is just a
                    wrong turn. Let&apos;s get you back.
                </p>
                <Button asChild size="lg" className="mt-8 h-11 gap-2 px-7">
                    <Link href="/">
                        Return home <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </div>
        </main>
    );
}
