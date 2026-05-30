"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
    LayoutDashboard,
    FileText,
    LayoutTemplate,
    Building2,
    Plus,
    Sun,
    Moon,
} from "~/components/icons";
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
} from "~/components/ui/command";
import { useListForms } from "~/hooks/api/form";

const NAV = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/forms", label: "Forms", icon: FileText },
    { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/dashboard/workspaces", label: "Workspaces", icon: Building2 },
];

/**
 * Global Cmd/Ctrl+K command palette for the dashboard.
 * Jump to a section, create a form, search existing forms, toggle theme.
 */
export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    // Only fetch forms while the palette is open — avoids an extra query on every page.
    const { forms } = useListForms(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        // Lets a button elsewhere (e.g. the sidebar) open the palette without prop drilling.
        const onOpen = () => setOpen(true);
        window.addEventListener("keydown", onKey);
        window.addEventListener("open-command-palette", onOpen);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("open-command-palette", onOpen);
        };
    }, []);

    // Close the palette before navigating so the dialog doesn't trap focus.
    const run = useCallback((fn: () => void) => {
        setOpen(false);
        fn();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search forms or jump to…" />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Actions">
                    <CommandItem
                        onSelect={() => run(() => router.push("/dashboard/forms?new=1"))}
                    >
                        <Plus />
                        <span>New form</span>
                        <CommandShortcut>C</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                        onSelect={() =>
                            run(() => setTheme(theme === "dark" ? "light" : "dark"))
                        }
                    >
                        {theme === "dark" ? <Sun /> : <Moon />}
                        <span>Toggle theme</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Go to">
                    {NAV.map((item) => (
                        <CommandItem
                            key={item.href}
                            onSelect={() => run(() => router.push(item.href))}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                {forms && forms.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Forms">
                            {forms.slice(0, 8).map((form) => (
                                <CommandItem
                                    key={form.id}
                                    // Prefix keyword keeps cmdk matching on the title text.
                                    value={`form ${form.title}`}
                                    onSelect={() =>
                                        run(() =>
                                            router.push(`/dashboard/forms/${form.id}`),
                                        )
                                    }
                                >
                                    <FileText />
                                    <span className="truncate">{form.title}</span>
                                    {form.status === "PUBLISHED" && (
                                        <CommandShortcut>Live</CommandShortcut>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
}
