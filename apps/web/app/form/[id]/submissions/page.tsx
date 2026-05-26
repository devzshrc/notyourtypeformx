"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useListSubmissions, useGetForm, useListFields, useGetAnalytics, useSubmissionTimeSeries } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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

const PAGE_SIZE = 20;

export default function SubmissionsPage() {
    const params = useParams<{ id: string }>();
    const formId = params.id;

    const { form } = useGetForm(formId);
    const { fields } = useListFields(formId);
    const { analytics } = useGetAnalytics(formId);
    const { timeSeries } = useSubmissionTimeSeries(formId);

    const [page, setPage] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { submissions, total, isLoading, error } = useListSubmissions(formId, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });

    const cols = fields ?? [];
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const hasScore = (submissions ?? []).some((s) => (s.data as Record<string, unknown>)?.__score != null);

    const SUMMARY_TYPES = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "YES_NO", "RATING"];
    const summaries = cols
        .filter((c) => SUMMARY_TYPES.includes(c.type))
        .map((c) => {
            const tally: Record<string, number> = {};
            for (const sub of submissions ?? []) {
                const v = (sub.data as Record<string, unknown>)[c.labelKey];
                const vals = Array.isArray(v) ? v : v != null && v !== "" ? [v] : [];
                for (const item of vals) { const k = String(item); tally[k] = (tally[k] ?? 0) + 1; }
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
                    <Link href={`/dashboard/forms/${formId}`}><Button variant="ghost" size="icon" aria-label="Back to form editor"><ArrowLeft className="size-4" /></Button></Link>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Submissions{total ? ` · ${total}` : ""}</p>
                        <h1 className="text-2xl font-semibold tracking-tight">{form?.title ?? "Loading..."}</h1>
                    </div>
                    <Button variant="outline" onClick={exportCsv} disabled={!submissions || submissions.length === 0}><Download className="mr-1 size-4" /> Export CSV</Button>
                </div>

                {/* Analytics cards */}
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

                {/* Time-series chart */}
                {timeSeries && timeSeries.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="mb-3 text-sm font-medium">Submissions (last 30 days)</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} className="text-muted-foreground" />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                                <Tooltip contentStyle={{ fontSize: 12 }} />
                                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label htmlFor="filter-start" className="text-xs text-muted-foreground">From</label>
                        <Input id="filter-start" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} className="w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="filter-end" className="text-xs text-muted-foreground">To</label>
                        <Input id="filter-end" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} className="w-40" />
                    </div>
                    {(startDate || endDate) && (
                        <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setPage(0); }}>Clear</Button>
                    )}
                </div>

                {/* Summaries */}
                {summaries.length > 0 && submissions && submissions.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {summaries.map(({ field, tally }) => {
                            const t = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
                            return (
                                <div key={field.id} className="rounded-lg border border-border bg-card p-4">
                                    <p className="mb-3 text-sm font-medium">{field.label}</p>
                                    <div className="flex flex-col gap-2">
                                        {Object.entries(tally).map(([opt, n]) => (
                                            <div key={opt}>
                                                <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{opt}</span><span>{n}</span></div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${(n / t) * 100}%` }} /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Table */}
                {isLoading ? (
                    <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : error ? (
                    <p className="text-sm text-destructive">{error.message}</p>
                ) : submissions && submissions.length > 0 ? (
                    <>
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {cols.map((c) => <TableHead key={c.id}>{c.label}</TableHead>)}
                                        {hasScore && <TableHead>Score</TableHead>}
                                        <TableHead>Submitted</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((sub) => {
                                        const data = (sub.data ?? {}) as Record<string, unknown>;
                                        return (
                                            <TableRow key={sub.id}>
                                                {cols.map((c) => <TableCell key={c.id}>{formatValue(data[c.labelKey])}</TableCell>)}
                                                {hasScore && <TableCell className="font-medium">{formatValue(data.__score)}</TableCell>}
                                                <TableCell className="whitespace-nowrap text-muted-foreground">{sub.createdAt ? new Date(sub.createdAt).toLocaleString() : ""}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages} · {total} total</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="mr-1 size-4" /> Prev</Button>
                                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next <ChevronRight className="ml-1 size-4" /></Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">No submissions yet.</p>
                )}
            </div>
        </main>
    );
}
