// Route-level loading UI — 少々お待ちください (one moment, please).
export default function DashboardLoading() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="enso flex size-16 animate-pulse items-center justify-center rounded-full">
                <span className="font-display text-2xl text-primary/70">待</span>
            </div>
            <div>
                <p className="font-display text-sm text-foreground">少々お待ちください</p>
                <p className="mt-0.5 text-xs text-muted-foreground">One moment, please…</p>
            </div>
        </div>
    );
}
