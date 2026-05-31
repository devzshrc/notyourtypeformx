"use client";

import { useRouter } from "next/navigation";
import { getCalApi } from "@calcom/embed-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowRight, AiBrain } from "~/components/icons";
import { FadeIn } from "~/components/motion";
import { RamenLoader } from "~/components/landing/ramen-loader";

const CAL_LINK = "de5ash1zh";
const VIDEO_START = 6; // skip the first 6s and loop from there
const LOOP_TAIL = 0.35; // jump back this long before the end, pre-empting the stall

export function Hero() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  // Only load the (heavy) background video on desktop. Mobile gets a static
  // dark base instead — no 32 MB download on cellular.
  const [withVideo, setWithVideo] = useState(false);

  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", { theme: "auto", hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = (matches: boolean) => {
      setWithVideo(matches);
      if (!matches) setReady(true); // no video to wait on → reveal immediately
    };
    apply(mq.matches);
    const on = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Safety: never let the loader stick if the video stalls or errors.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const seekStart = () => {
    const v = videoRef.current;
    if (v && v.currentTime < VIDEO_START) v.currentTime = VIDEO_START;
  };
  // Seamless loop from 6s: jump back just before the real end so there is no
  // end-of-stream stall/flash.
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (v.currentTime >= v.duration - LOOP_TAIL || v.currentTime < VIDEO_START) {
      v.currentTime = VIDEO_START;
    }
  };

  return (
    <section className="relative isolate -mt-16 overflow-hidden border-b border-border">
      <RamenLoader done={ready} />
      {/* static dark base (shown on mobile / before the video paints) */}
      <div className="absolute inset-0 z-0 bg-[oklch(0.15_0.03_350)]" />
      {/* ambient background clip — desktop only (heavy file) */}
      {withVideo && (
        <video
          ref={videoRef}
          src="/japan.mp4#t=6"
          autoPlay
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden
          onLoadedMetadata={seekStart}
          onCanPlay={() => setReady(true)}
          onTimeUpdate={onTimeUpdate}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        />
      )}
      {/* theme-independent dark scrim — keeps the video clear while light text reads */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-black/70 via-black/40 to-black/15" />

      <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-12 px-6 pb-16 pt-32 md:grid-cols-[1.05fr_0.95fr] md:pb-24 md:pt-40">
        {/* vertical kanji rail — "AIで、書式を。" (with AI, the form) */}
        <span
          aria-hidden
          className="font-display pointer-events-none absolute left-2 top-24 hidden text-xs uppercase tracking-[0.35em] text-white/45 [writing-mode:vertical-rl] lg:block"
        >
          AIで、書式を。
        </span>

        <FadeIn>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
            <AiBrain className="size-3.5 text-[oklch(0.80_0.16_358)]" />
            AI書式 · AI-native form builder
          </span>

          <h1 className="font-display mt-6 max-w-[18ch] text-5xl font-semibold leading-[0.98] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:text-7xl">
            Forms that build{" "}
            <span className="text-[oklch(0.80_0.16_358)]">themselves</span>.
          </h1>

          <p className="mt-4 font-display text-base text-white/75">
            考えを、ひとことで。— say it once.
          </p>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
            Describe what you want to collect in one sentence. Schema writes the
            questions, field types, validation, and logic — ready to publish.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
              className="h-12 border-white/30 bg-white/5 px-7 text-base text-white hover:bg-white/15 hover:text-white"
              data-cal-link={CAL_LINK}
              data-cal-config='{"layout":"month_view"}'
            >
              Book a demo
            </Button>
          </div>
        </FadeIn>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-md border border-border bg-muted">
        {/* plain <img> on purpose: no optimizer/fill so it always renders */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/hero-jp.jpg"
          alt="A sleeping cat, ukiyo-e woodblock print in indigo and vermilion"
          className="block h-[360px] w-full object-cover md:h-[460px]"
        />
        {/* vertical caption plate, like a hanging scroll signature */}
        <span className="font-display absolute right-3 top-3 rounded bg-black/45 px-1.5 py-2 text-[11px] tracking-widest text-white backdrop-blur-sm [writing-mode:vertical-rl]">
          静けさ · quiet by design
        </span>
      </div>

      {/* hanko (印) — vermilion seal stamp overlapping the frame */}
      <div className="hanko absolute -bottom-4 -left-4 flex size-16 rotate-[-6deg] items-center justify-center rounded-md text-2xl text-white shadow-lg">
        <span className="font-display leading-none">眠</span>
      </div>
    </div>
  );
}
