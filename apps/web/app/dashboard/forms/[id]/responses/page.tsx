"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, FileSpreadsheet, ChevronLeft, ChevronRight, Inbox } from "~/components/icons";
import { EmptyState } from "~/components/ui/empty-state";
import { formatRelativeTime, formatAbsoluteTime } from "~/lib/utils";
import * as XLSX from "xlsx";
import { useListSubmissions, useGetForm, useListFields, useGetAnalytics, useSubmissionTimeSeries } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { motion, StaggerList, StaggerItem, type Variants } from "~/components/motion";
import type { CSSProperties } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

const statCardVariants: Variants = {
    rest:  { y: 0 },
    hover: { y: -2, transition: { type: "spring", stiffness: 300, damping: 25 } },
};
const WC_TRANSFORM: CSSProperties = { willChange: "transform" };

function formatValue(v: unknown): string {
    if (v === undefined || v === null || v === "") return "-";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
}

function csvEscape(s: string): string {
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

const PAGE_SIZE = 20;

export default function ResponsesPage() {
    const params = useParams<{ id: string }>();
    const formId = params.id;

    const { form } = useGetForm(formId);
    const { fields } = useListFields(formId);
    const { analytics } = useGetAnalytics(formId);
    const { timeSeries } = useSubmissionTimeSeries(formId);

    const [page, setPage] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState("");

    const { submissions, total, isLoading, error } = useListSubmissions(formId, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search.trim() || undefined,
    });

    const cols = fields ?? [];
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const rows = submissions ?? [];
    const hasScore = rows.some((s) => (s.data as Record<string, unknown>)?.__score != null);

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

    const exportXlsx = () => {
        if (!submissions) return;
        const header = [...cols.map((c) => c.label), "Submitted At"];
        const rows = submissions.map((sub) => {
            const data = (sub.data ?? {}) as Record<string, unknown>;
            return [...cols.map((c) => formatValue(data[c.labelKey])), sub.createdAt ? new Date(sub.createdAt).toLocaleString() : ""];
        });
        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Responses");
        XLSX.writeFile(wb, `${form?.title ?? "form"}-responses.xlsx`);
    };

    return (
        <div className="px-4 py-6 text-foreground sm:px-6 sm:py-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href={`/dashboard/forms/${formId}`}><Button variant="ghost" size="icon" aria-label="Back to form editor"><ArrowLeft className="size-4" /></Button></Link>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Responses{total ? ` · ${total}` : ""}</p>
                        <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{form?.title ?? "Loading..."}</h1>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!submissions || submissions.length === 0}><Download className="size-4 sm:mr-1" /> <span className="hidden sm:inline">CSV</span></Button>
                        <Button variant="outline" size="sm" onClick={exportXlsx} disabled={!submissions || submissions.length === 0}><FileSpreadsheet className="size-4 sm:mr-1" /> <span className="hidden sm:inline">Excel</span></Button>
                    </div>
                </div>

                {/* Analytics cards */}
                {analytics && (
                    <StaggerList className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { label: "Views",      value: analytics.views },
                            { label: "Starts",     value: analytics.starts },
                            { label: "Responses",  value: analytics.submissions },
                            { label: "Completion", value: `${analytics.completionRate}%` },
                        ].map((stat) => (
                            <StaggerItem key={stat.label}>
                                <motion.div
                                    initial="rest"
                                    whileHover="hover"
                                    animate="rest"
                                    variants={statCardVariants}
                                    style={WC_TRANSFORM}
                                    className="rounded-lg border border-border bg-card p-4 cursor-default"
                                >
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-semibold">{stat.value}</p>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </StaggerList>
                )}

                {/* Conversion funnel */}
                {analytics && analytics.views > 0 && (
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="mb-4 text-sm font-medium">Conversion funnel</p>
                        <div className="flex flex-col gap-3">
                            {(() => {
                                const stages = [
                                    { label: "Views", value: analytics.views },
                                    { label: "Starts", value: analytics.starts },
                                    { label: "Responses", value: analytics.submissions },
                                ];
                                const top = analytics.views || 1;
                                return stages.map((s, i) => {
                                    const prev = i === 0 ? s.value : stages[i - 1]!.value;
                                    // Drop-off relative to the previous stage (guard divide-by-zero).
                                    const dropPct = i === 0 || prev === 0 ? 0 : Math.round(((prev - s.value) / prev) * 100);
                                    const widthPct = Math.round((s.value / top) * 100);
                                    return (
                                        <div key={s.label}>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className="font-medium text-foreground">{s.label}</span>
                                                <span className="text-muted-foreground">
                                                    {s.value}
                                                    {i > 0 && dropPct > 0 && (
                                                        <span className="ml-2 text-destructive">−{dropPct}%</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="h-7 overflow-hidden rounded-md bg-muted">
                                                <motion.div
                                                    className="h-full rounded-md bg-primary"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${widthPct}%` }}
                                                    transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                                                    style={WC_TRANSFORM}
                                                />
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
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
                                <Area type="monotone" dataKey="count" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Search responses..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="w-56"
                    />
                    <div className="flex items-center gap-2">
                        <label htmlFor="filter-start" className="text-xs text-muted-foreground">From</label>
                        <Input id="filter-start" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} className="w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="filter-end" className="text-xs text-muted-foreground">To</label>
                        <Input id="filter-end" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} className="w-40" />
                    </div>
                    {(startDate || endDate || search) && (
                        <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setSearch(""); setPage(0); }}>Clear all</Button>
                    )}
                </div>

                {/* Summaries */}
                {summaries.length > 0 && submissions && submissions.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {summaries.map(({ field, tally }) => {
                            const t = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
                            // For RATING fields, surface the weighted average alongside the distribution.
                            const ratingAvg = field.type === "RATING"
                                ? (Object.entries(tally).reduce((sum, [k, n]) => sum + Number(k) * n, 0) / t)
                                : null;
                            return (
                                <div key={field.id} className="rounded-lg border border-border bg-card p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-medium">{field.label}</p>
                                        {ratingAvg != null && Number.isFinite(ratingAvg) && (
                                            <span className="text-xs text-muted-foreground">avg <span className="font-semibold text-foreground">{ratingAvg.toFixed(1)}</span></span>
                                        )}
                                    </div>
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
                        {search && (
                            <p className="text-sm text-muted-foreground">
                                {total} result{total !== 1 ? "s" : ""} match &ldquo;{search}&rdquo;
                            </p>
                        )}
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
                                    {rows.map((sub) => {
                                        const data = (sub.data ?? {}) as Record<string, unknown>;
                                        return (
                                            <TableRow key={sub.id}>
                                                {cols.map((c) => <TableCell key={c.id}>{formatValue(data[c.labelKey])}</TableCell>)}
                                                {hasScore && <TableCell className="font-medium">{formatValue(data.__score)}</TableCell>}
                                                <TableCell className="whitespace-nowrap text-muted-foreground" title={formatAbsoluteTime(sub.createdAt)}>{formatRelativeTime(sub.createdAt)}</TableCell>
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
                    <EmptyState
                        icon={<Inbox className="size-5" />}
                        title="No responses yet"
                        description="Responses will appear here once people start submitting your form."
                    />
                )}
            </div>
        </div>
    );
}
