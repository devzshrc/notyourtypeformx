"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "~/components/icons";
import { FadeInView } from "~/components/motion";

export function FinalCta() {
  const router = useRouter();
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
      <FadeInView className="relative overflow-hidden rounded-md border border-border bg-card px-6 py-20 text-center md:py-24">
        {/* hanko seal accent */}
        <div className="hanko absolute right-6 top-6 hidden size-14 rotate-[-6deg] items-center justify-center rounded-md text-xl text-white shadow-md md:flex">
          <span className="font-display leading-none">完</span>
        </div>
        <div className="mx-auto max-w-xl">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            始めよう · Begin
          </span>
          <h2 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
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
