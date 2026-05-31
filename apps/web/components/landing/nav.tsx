"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import { ArrowRight } from "~/components/icons";
import { useUser } from "~/hooks/api/auth";
import { cn } from "~/lib/utils";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "/pricing" },
];

export function LandingNav() {
  const { data: user, isLoading } = useUser();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={cn(
              "font-display flex items-center gap-2 text-xl font-semibold tracking-tight",
              scrolled ? "text-foreground" : "text-white",
            )}
          >
            <span className="sun-disc inline-block size-3.5 rounded-full" />
            Schema
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm transition-colors",
                  scrolled
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white/80 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoading &&
            (user?.id ? (
              <Button size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard <ArrowRight className="size-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "hidden sm:inline-flex",
                    !scrolled && "text-white hover:bg-white/15 hover:text-white",
                  )}
                  onClick={() => router.push("/signin")}
                >
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
  );
}
