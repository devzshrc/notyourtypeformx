"use client";

import { useRouter } from "next/navigation";
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowRight, AiBrain, Sparkles, Check } from "~/components/icons";
import { FadeIn, motion, useReducedMotion } from "~/components/motion";
import { Spotlight } from "~/components/ui/spotlight";

const CAL_LINK = "de5ash1zh";

export function Hero() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", { theme: "auto", hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* layered backdrop: Aceternity spotlight + faded dot grid, monochrome */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="currentColor"
        />
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-foreground/[0.05] blur-3xl" />
        <div className="bg-dot-grid absolute inset-0 text-foreground/[0.04] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-20 md:pb-24 md:pt-24">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
            <AiBrain className="size-3.5" />
            AI-native form builder
          </Badge>

          <h1 className="mx-auto mt-7 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Stop building forms.
            <br />
            <span className="text-muted-foreground">Just describe them.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            One sentence becomes a complete conversational form. Questions,
            validation, and logic included.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 px-7 text-base"
              onClick={() => router.push("/signup")}
            >
              Build a form free <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 text-base"
              data-cal-link={CAL_LINK}
              data-cal-config='{"layout":"month_view"}'
            >
              Book a demo
            </Button>
          </div>
        </FadeIn>

        <HeroPreview />
      </div>
    </section>
  );
}

/**
 * Real component preview: a genuine mini version of the product surface
 * (prompt bar transforming into a rendered conversational form), not a
 * static fake-screenshot. Honest representation of the core interaction.
 */
function HeroPreview() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto mt-16 max-w-4xl"
    >
      <div className="relative rounded-2xl border border-border bg-card p-2 shadow-xl shadow-foreground/[0.04]">
        {/* prompt bar */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3">
          <Sparkles className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm text-foreground">
            A signup form for a product launch waitlist with role and team size
          </span>
          <span className="ml-auto hidden shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground sm:inline">
            Generate
          </span>
        </div>

        {/* generated form surface */}
        <div className="grid gap-3 p-4 md:grid-cols-5 md:p-6">
          <div className="md:col-span-3">
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="text-xs text-muted-foreground">Question 2 of 5</div>
              <div className="mt-2 text-lg font-medium">
                What best describes your role?
              </div>
              <div className="mt-4 grid gap-2">
                {["Founder", "Engineering", "Design", "Operations"].map(
                  (opt, i) => (
                    <div
                      key={opt}
                      className={
                        "flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm " +
                        (i === 1
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground")
                      }
                    >
                      {opt}
                      {i === 1 && <Check className="size-4" />}
                    </div>
                  ),
                )}
              </div>
              <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/5 rounded-full bg-foreground" />
              </div>
            </div>
          </div>

          <div className="grid content-start gap-3 md:col-span-2">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="text-xs text-muted-foreground">Generated fields</div>
              <ul className="mt-3 space-y-2">
                {[
                  { name: "Full name", type: "text" },
                  { name: "Work email", type: "email" },
                  { name: "Role", type: "choice" },
                  { name: "Team size", type: "number" },
                ].map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">{f.name}</span>
                    <span className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {f.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
