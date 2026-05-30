import { LandingNav } from "~/components/landing/nav";
import { Hero } from "~/components/landing/hero";
import { Features } from "~/components/landing/features";
import { HowItWorks } from "~/components/landing/how-it-works";
import { Templates } from "~/components/landing/templates";
import { Faq } from "~/components/landing/faq";
import { FinalCta } from "~/components/landing/cta";
import { Footer } from "~/components/landing/footer";

export default function Home() {
  return (
    <div
      id="main-content"
      className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground"
    >
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Templates />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
