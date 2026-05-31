import Image from "next/image";
import { LandingNav } from "~/components/landing/nav";
import { Hero } from "~/components/landing/hero";
import { StatStrip } from "~/components/landing/stat-strip";
import { Features } from "~/components/landing/features";
import { Philosophy } from "~/components/landing/philosophy";
import { HowItWorks } from "~/components/landing/how-it-works";
import { Templates } from "~/components/landing/templates";
import { Faq } from "~/components/landing/faq";
import { FinalCta } from "~/components/landing/cta";
import { Footer } from "~/components/landing/footer";

export default function Home() {
  return (
    <div
      id="main-content"
      className="font-sans relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground"
    >
      <LandingNav />
      <main>
        <Hero />
        <StatStrip />
        <div aria-hidden className="seigaiha mx-auto my-16 h-[22px] max-w-[1200px] px-6 text-primary/25 md:my-20" />
        <Features />
        <Philosophy />
        <HowItWorks />
        <Templates />
        <section className="mx-auto max-w-[1200px] px-6">
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-md border border-border">
            <Image
              src="/landing/ukiyo-2.jpg"
              alt="Mount Fuji at dawn beyond a quiet Japanese street"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        </section>
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
