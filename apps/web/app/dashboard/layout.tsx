"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, LogOut, Building2, LayoutTemplate, Sun, Moon } from "~/components/icons";
import { useTheme } from "next-themes";
import { useUser, useLogout } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Monogram } from "~/components/ui/monogram";
import { Kbd } from "~/components/ui/kbd";
import { Search } from "~/components/icons";
import { CommandPalette } from "~/components/command-palette";
import {
    motion,
    AnimatePresence,
    SlideIn,
    StaggerList,
    StaggerItem,
    useReducedMotion,
} from "~/components/motion";
import type { CSSProperties } from "react";
import type { Variants } from "~/components/motion";

// ─── Module-level variants ────────────────────────────────────────────────────
const avatarVariants: Variants = {
    rest:  { scale: 1 },
    hover: { scale: 1.03, transition: { type: "spring", stiffness: 320, damping: 32 } },
};

const WC_TRANSFORM: CSSProperties = { willChange: "transform" };
const WC_OPACITY:   CSSProperties = { willChange: "opacity" };
const WC_OPACITY_TRANSFORM: CSSProperties = { willChange: "opacity, transform" };

const NAV_ITEMS = [
    { href: "/dashboard",            label: "Overview",   icon: LayoutDashboard },
    { href: "/dashboard/forms",      label: "Forms",      icon: FileText },
    { href: "/dashboard/templates",  label: "Templates",  icon: LayoutTemplate },
    { href: "/dashboard/workspaces", label: "Workspaces", icon: Building2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname   = usePathname();
    const router     = useRouter();
    const { data: user, isLoading } = useUser();
    const { logoutAsync }  = useLogout();
    const { theme, setTheme } = useTheme();
    const shouldReduce = useReducedMotion();

    // Middleware gates /dashboard on session marker; this is the fallback for an
    // expired/invalid session (marker present but JWT rejected by the API). Clear
    // both cookies then redirect. Redirect via effect, never during render.
    useEffect(() => {
        if (!isLoading && !user?.id) {
            logoutAsync().catch(() => {
                fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
            }).finally(() => router.replace("/"));
        }
    }, [isLoading, user?.id, router, logoutAsync]);

    if (isLoading || !user?.id) {
        return <div className="min-h-[100dvh] bg-background" />;
    }

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    const handleLogout = async () => {
        await logoutAsync();
        router.replace("/");
    };

    return (
        <div className="flex min-h-[100dvh] bg-background">
            <CommandPalette />
            {/* ── Sidebar ── */}
            <SlideIn direction="left" className="hidden md:flex">
                <aside className="relative flex w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar">
                    {/* faint washi grain (overlay so it doesn't tint text) */}
                    <div aria-hidden className="washi pointer-events-none absolute inset-0 text-foreground/[0.04]" />
                    {/* Noren (暖簾) — split-curtain accent at the top of the sidebar */}
                    <div aria-hidden className="noren absolute inset-x-0 top-0 z-10 h-1 opacity-80" />
                    {/* Logo */}
                    <div className="relative px-5 py-5 pt-6">
                        <Link href="/" className="font-display flex items-center gap-2 text-lg font-semibold tracking-tight">
                            <span className="sun-disc inline-block size-3 rounded-full" />
                            Schema
                        </Link>
                    </div>

                    {/* Command palette trigger */}
                    <div className="px-3 pb-2">
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                            className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <Search className="size-4" />
                            <span className="flex-1 text-left">Search…</span>
                            <Kbd>⌘K</Kbd>
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex flex-1 flex-col gap-4 px-3">
                        <StaggerList delay={0.1}>
                            {NAV_ITEMS.map((item) => {
                                const active = pathname === item.href ||
                                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                return (
                                    <StaggerItem key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                                                active
                                                    ? "text-primary-foreground"
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                            }`}
                                        >
                                            {/* layoutId animated active pill */}
                                            <AnimatePresence>
                                                {active && (
                                                    <motion.span
                                                        layoutId="nav-active-pill"
                                                        className="absolute inset-0 rounded-lg bg-primary"
                                                        initial={shouldReduce ? false : { opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                                                        style={{ ...WC_OPACITY, zIndex: 0 }}
                                                    />
                                                )}
                                            </AnimatePresence>
                                            <item.icon className={`relative z-10 size-4 ${active ? "text-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"}`} />
                                            <span className="relative z-10">{item.label}</span>
                                        </Link>
                                    </StaggerItem>
                                );
                            })}
                        </StaggerList>
                    </nav>

                    {/* User section */}
                    <motion.div
                        initial={shouldReduce ? false : { opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 34 }}
                        style={WC_OPACITY}
                        className="border-t border-border/60 px-3 py-4"
                    >
                        <div className="mb-3 flex items-center gap-3 px-3 py-2">
                            <motion.div
                                initial="rest"
                                whileHover="hover"
                                variants={avatarVariants}
                                style={WC_TRANSFORM}
                                className="shrink-0 cursor-default"
                            >
                                <Monogram name={user?.email ?? "user"} className="size-8 text-xs" />
                            </motion.div>
                            <p className="min-w-0 flex-1 truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost" size="sm"
                                className="flex-1 justify-start text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 size-3.5" /> Sign out
                            </Button>
                            <Button
                                variant="ghost" size="icon"
                                className="size-8 text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                            </Button>
                        </div>
                    </motion.div>
                </aside>
            </SlideIn>

            {/* ── Mobile header ── */}
            <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
                <header className="flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm md:hidden">
                    <Link href="/" className="text-lg font-semibold tracking-tight">
                        Schema
                    </Link>
                    <div className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const active = pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-label={item.label}
                                    aria-current={active ? "page" : undefined}
                                    title={item.label}
                                    className={`rounded-lg p-2 transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                                >
                                    <item.icon className="size-5" />
                                </Link>
                            );
                        })}
                        <Button variant="ghost" size="icon" className="size-9" onClick={handleLogout} aria-label="Sign out"><LogOut className="size-4" /></Button>
                    </div>
                </header>

                {/* Page content with transition */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={pathname}
                        initial={shouldReduce ? false : { opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduce ? {} : { opacity: 0, y: -3 }}
                        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                        style={WC_OPACITY_TRANSFORM}
                        className="flex-1"
                        id="main-content"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
}
