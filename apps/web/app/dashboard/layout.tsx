"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useUser, useLogout } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/forms", label: "Forms", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: user, isLoading } = useUser();
    const { logoutAsync } = useLogout();
    const { theme, setTheme } = useTheme();

    // Auth guard
    if (!isLoading && !user?.id) {
        router.replace("/signin");
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Skeleton className="h-8 w-32" />
            </div>
        );
    }

    const handleLogout = async () => {
        await logoutAsync();
        router.replace("/signin");
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar p-4 md:flex md:flex-col">
                <Link href="/dashboard" className="mb-6 text-lg font-bold text-sidebar-foreground">
                    ChaiForms
                </Link>
                <nav className="flex flex-1 flex-col gap-1">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}
                            >
                                <item.icon className="size-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-sidebar-border pt-4">
                    <p className="mb-2 truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="flex-1 justify-start text-sidebar-foreground/70" onClick={handleLogout}>
                            <LogOut className="mr-2 size-4" /> Sign out
                        </Button>
                        <Button variant="ghost" size="icon" className="text-sidebar-foreground/70" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
                            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile header */}
            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
                    <Link href="/dashboard" className="text-lg font-bold">ChaiForms</Link>
                    <div className="flex items-center gap-2">
                        {NAV_ITEMS.map((item) => (
                            <Link key={item.href} href={item.href} className="rounded-md p-2 text-muted-foreground hover:text-foreground">
                                <item.icon className="size-5" />
                            </Link>
                        ))}
                        <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="size-4" /></Button>
                    </div>
                </header>
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
