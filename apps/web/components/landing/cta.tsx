"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "~/components/icons";
import { FadeInView } from "~/components/motion";

export function FinalCta() {
  const router = useRouter();
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
      <FadeInView className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-20 text-center md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.06] blur-3xl" />
          <div className="bg-dot-grid absolute inset-0 text-foreground/[0.05] [mask-image:radial-gradient(ellipse_50%_60%_at_50%_50%,#000,transparent_75%)]" />
        </div>
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Your next form is one sentence away
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">
            Describe it, publish it, and start collecting responses today.
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
              onClick={() => router.push("/pricing")}
            >
              See pricing
            </Button>
          </div>
        </div>
      </FadeInView>
    </section>
  );
}
