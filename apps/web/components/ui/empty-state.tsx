import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/**
 * Consistent empty-state block: optional icon, title, supporting line, optional CTA.
 * Use everywhere a list/table/grid can be empty so the app reads the same throughout.
 */
function EmptyState({
    icon,
    kanji = "空",
    title,
    description,
    action,
    className,
}: {
    icon?: ReactNode;
    /** Kanji shown inside the ensō ring when no icon is given. Default 空 (emptiness). */
    kanji?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center",
                className,
            )}
        >
            {icon ? (
                <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {icon}
                </div>
            ) : (
                // ensō (円相) — an open Zen circle around 空, beauty in emptiness
                <div className="enso mb-4 flex size-16 items-center justify-center rounded-full">
                    <span className="font-display text-2xl text-primary/70">{kanji}</span>
                </div>
            )}
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && (
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export { EmptyState };
