"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useListSubmissions, useGetForm, useListFields, useGetAnalytics } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

function formatValue(v: unknown): string {
    if (v === undefined || v === null || v === "") return "—";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
}

function csvEscape(s: string): string {
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

export default function SubmissionsPage() {
    const params = useParams<{ id: string }>();
    const formId = params.id;

    const { form } = useGetForm(formId);
    const { fields } = useListFields(formId);
    const { submissions, isLoading, error } = useListSubmissions(formId);
    const { analytics } = useGetAnalytics(formId);

    const cols = fields ?? [];
    const hasScore = (submissions ?? []).some((s) => (s.data as Record<string, unknown>)?.__score != null);

    const SUMMARY_TYPES = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "YES_NO", "RATING"];
    const summaries = cols
        .filter((c) => SUMMARY_TYPES.includes(c.type))
        .map((c) => {
            const tally: Record<string, number> = {};
            for (const sub of submissions ?? []) {
                const v = (sub.data as Record<string, unknown>)[c.labelKey];
                const vals = Array.isArray(v) ? v : v != null && v !== "" ? [v] : [];
                for (const item of vals) {
                    const k = String(item);
                    tally[k] = (tally[k] ?? 0) + 1;
                }
            }
            return { field: c, tally };
        });

    const exportCsv = () => {
        if (!submissions) return;
        const header = [...cols.map((c) => c.label), "Submitted At"];
        const rows = submissions.map((sub) => {
            const data = (sub.data ?? {}) as Record<string, unknown>;
            const cells = cols.map((c) => formatValue(data[c.labelKey]));
            cells.push(sub.createdAt ? new Date(sub.createdAt).toISOString() : "");
            return cells;
        });
        const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(String(v))).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${form?.title ?? "form"}-responses.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main className="min-h-screen bg-background px-6 py-6 text-foreground">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                            Submissions{submissions ? ` · ${submissions.length}` : ""}
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {form?.title ?? "Loading..."}
                        </h1>
                    </div>
                    <Button
                        variant="outline"
                        onClick={exportCsv}
                        disabled={!submissions || submissions.length === 0}
                    >
                        <Download className="mr-1 size-4" /> Export CSV
                    </Button>
                </div>

                {analytics && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { label: "Views", value: analytics.views },
                            { label: "Starts", value: analytics.starts },
                            { label: "Responses", value: analytics.submissions },
                            { label: "Completion", value: `${analytics.completionRate}%` },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-semibold">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {summaries.length > 0 && submissions && submissions.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {summaries.map(({ field, tally }) => {
                            const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
                            return (
                                <div key={field.id} className="rounded-lg border border-border bg-card p-4">
                                    <p className="mb-3 text-sm font-medium">{field.label}</p>
                                    <div className="flex flex-col gap-2">
                                        {Object.entries(tally).map(([opt, n]) => (
                                            <div key={opt}>
                                                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                                                    <span>{opt}</span>
                                                    <span>{n}</span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${(n / total) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(tally).length === 0 && (
                                            <p className="text-xs text-muted-foreground">No answers yet.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading submissions...</p>
                ) : error ? (
                    <p className="text-sm text-destructive">{error.message}</p>
                ) : submissions && submissions.length > 0 ? (
                    <div className="rounded-lg border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {cols.map((c) => (
                                        <TableHead key={c.id}>{c.label}</TableHead>
                                    ))}
                                    {hasScore && <TableHead>Score</TableHead>}
                                    <TableHead>Submitted</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub) => {
                                    const data = (sub.data ?? {}) as Record<string, unknown>;
                                    return (
                                        <TableRow key={sub.id}>
                                            {cols.map((c) => (
                                                <TableCell key={c.id}>
                                                    {formatValue(data[c.labelKey])}
                                                </TableCell>
                                            ))}
                                            {hasScore && (
                                                <TableCell className="font-medium">
                                                    {formatValue(data.__score)}
                                                </TableCell>
                                            )}
                                            <TableCell className="whitespace-nowrap text-muted-foreground">
                                                {sub.createdAt
                                                    ? new Date(sub.createdAt).toLocaleString()
                                                    : ""}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                        No submissions yet.
                    </p>
                )}
            </div>
        </main>
    );
}
