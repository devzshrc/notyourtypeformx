"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, LogOut, Building2, Sun, Moon } from "~/components/icons";
import { useTheme } from "next-themes";
import { useUser, useLogout } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
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
    hover: { scale: 1.08, transition: { type: "spring", stiffness: 400, damping: 17 } },
};

const WC_TRANSFORM: CSSProperties = { willChange: "transform" };
const WC_OPACITY:   CSSProperties = { willChange: "opacity" };

const NAV_ITEMS = [
    { href: "/dashboard",            label: "Overview",   icon: LayoutDashboard },
    { href: "/dashboard/forms",      label: "Forms",      icon: FileText },
    { href: "/dashboard/workspaces", label: "Workspaces", icon: Building2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname   = usePathname();
    const router     = useRouter();
    const { data: user, isLoading } = useUser();
    const { logoutAsync }  = useLogout();
    const { theme, setTheme } = useTheme();
    const shouldReduce = useReducedMotion();

    if (!isLoading && !user?.id) {
        router.replace("/signin");
        return null;
    }

    if (isLoading) {
        return <div className="min-h-screen bg-background" />;
    }

    const handleLogout = async () => {
        await logoutAsync();
        router.replace("/signin");
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* ── Sidebar ── */}
            <SlideIn direction="left" className="hidden md:flex">
                <aside className="flex w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar">
                    {/* Logo */}
                    <div className="px-5 py-5">
                        <Link href="/dashboard">
                            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Schema
                            </span>
                        </Link>
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
                                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
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
                        initial={shouldReduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                        style={WC_OPACITY}
                        className="border-t border-border/60 px-3 py-4"
                    >
                        <div className="mb-3 flex items-center gap-3 px-3 py-2">
                            <motion.div
                                initial="rest"
                                whileHover="hover"
                                variants={avatarVariants}
                                style={WC_TRANSFORM}
                                className="flex size-8 shrink-0 cursor-default items-center justify-center overflow-hidden rounded-full bg-primary/15"
                            >
                                <img
                                    src={`https://robohash.org/${encodeURIComponent(user?.email ?? "user")}?size=32x32`}
                                    alt="avatar"
                                    className="size-full"
                                />
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
                                className="size-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                aria-label="Toggle theme"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={theme}
                                        initial={{ clipPath: "inset(0 0 100% 0)" }}
                                        animate={{ clipPath: "inset(0 0 0% 0)" }}
                                        exit={{ clipPath: "inset(100% 0 0 0)" }}
                                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                    >
                                        {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                                    </motion.div>
                                </AnimatePresence>
                            </Button>
                        </div>
                    </motion.div>
                </aside>
            </SlideIn>

            {/* ── Mobile header ── */}
            <div className="flex flex-1 flex-col min-w-0">
                <header className="flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm md:hidden">
                    <Link href="/dashboard" className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Schema
                    </Link>
                    <div className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <Link key={item.href} href={item.href} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                <item.icon className="size-5" />
                            </Link>
                        ))}
                        <Button variant="ghost" size="icon" className="size-9" onClick={handleLogout}><LogOut className="size-4" /></Button>
                    </div>
                </header>

                {/* Page content with transition */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={pathname}
                        initial={shouldReduce ? false : { opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduce ? {} : { opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                        style={WC_OPACITY}
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
