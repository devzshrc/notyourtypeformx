"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCalApi } from "@calcom/embed-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowRight, AiBrain } from "~/components/icons";
import { useUser } from "~/hooks/api/auth";
import { FadeIn } from "~/components/motion";

const CAL_LINK = "de5ash1zh";

export default function Home() {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", { theme: "auto", hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <div id="main-content" className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Schema
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="mr-2 hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
              Pricing
            </Link>
            {!isLoading &&
              (user?.id ? (
                <Button size="sm" onClick={() => router.push("/dashboard")}>
                  Dashboard <ArrowRight className="size-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/signin")}>
                    Sign in
                  </Button>
                  <Button size="sm" onClick={() => router.push("/signup")}>
                    Get started
                  </Button>
                </>
              ))}
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,transparent,var(--background)_70%)]" />
        </div>

        <FadeIn className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center">
          <Badge variant="secondary" className="gap-1.5">
            <AiBrain className="size-3" />
            AI-native form builder
          </Badge>

          <h1 className="mx-auto mt-7 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            Stop building forms.
            <br />
            <span className="text-muted-foreground">Just describe them.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            One sentence becomes a complete, conversational form — questions, validation, and logic included.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 gap-2 px-8 text-base" onClick={() => router.push("/signup")}>
              Build a form free <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" data-cal-link={CAL_LINK} data-cal-config='{"layout":"month_view"}'>
              Book a demo
            </Button>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
