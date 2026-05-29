import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/**
 * Consistent empty-state block: optional icon, title, supporting line, optional CTA.
 * Use everywhere a list/table/grid can be empty so the app reads the same throughout.
 */
function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center",
                className,
            )}
        >
            {icon && (
                <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {icon}
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
