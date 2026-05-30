"use client";

import type { CSSProperties } from "react";
import { themeVarsFor } from "~/lib/form-themes";

/**
 * Mini public-form mock rendered with a theme's CSS variables so users see the
 * real look (background, card, primary, radius) before applying — not just a swatch.
 */
export function ThemePreview({
    theme,
    isDark = false,
    className,
}: {
    theme: string;
    isDark?: boolean;
    className?: string;
}) {
    const vars = themeVarsFor(theme, isDark) as CSSProperties;
    return (
        <div
            style={vars}
            className={`overflow-hidden rounded-[var(--radius)] border ${className ?? ""}`}
        >
            <div
                className="flex flex-col gap-2 p-4"
                style={{ background: "var(--background)", color: "var(--foreground)" }}
            >
                <div className="text-[10px] opacity-60">Question 1 of 3</div>
                <div className="text-sm font-semibold leading-tight">
                    What&apos;s your name?
                </div>
                {/* fake text input */}
                <div
                    className="mt-1 h-6 rounded-[var(--radius)] border"
                    style={{ borderColor: "var(--input)", background: "var(--card)" }}
                />
                {/* fake choice chips */}
                <div className="mt-1 flex gap-1.5">
                    <div
                        className="flex-1 rounded-[var(--radius)] px-2 py-1 text-[10px] font-medium"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                    >
                        OK
                    </div>
                    <div
                        className="rounded-[var(--radius)] border px-2 py-1 text-[10px]"
                        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                    >
                        Back
                    </div>
                </div>
            </div>
        </div>
    );
}
