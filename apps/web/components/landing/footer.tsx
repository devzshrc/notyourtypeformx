import Link from "next/link";

const GROUPS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Sign in", href: "/signin" },
      { label: "Get started", href: "/signup" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="font-display flex items-center gap-2 text-xl font-semibold tracking-tight">
            <span className="sun-disc inline-block size-3.5 rounded-full" />
            Schema
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            The AI-native form builder. Describe a form, ship it in seconds.
          </p>
        </div>
        {GROUPS.map((g) => (
          <div key={g.heading}>
            <div className="text-sm font-medium">{g.heading}</div>
            <ul className="mt-4 space-y-3">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="sumi-link text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>Copyright 2026 Schema. All rights reserved.</span>
          <span>Built for people who hate building forms.</span>
        </div>
      </div>
    </footer>
  );
}
