"use client";

import Link from "next/link";
import { BarChart3, FileText, Eye, CheckCircle, ArrowRight, Plus } from "lucide-react";
import { useAdminStats, useListForms } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export default function AdminDashboard() {
    const { stats, isLoading: statsLoading } = useAdminStats();
    const { forms, isLoading: formsLoading } = useListForms();

    const recentForms = (forms ?? []).slice(0, 5);

    return (
        <div className="px-6 py-8">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
                <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>

                {/* Stats */}
                {statsLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
                    </div>
                ) : stats ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard icon={<FileText className="size-5 text-blue-500" />} label="Total Forms" value={stats.totalForms} />
                        <StatCard icon={<BarChart3 className="size-5 text-green-500" />} label="Total Submissions" value={stats.totalSubmissions} />
                        <StatCard icon={<Eye className="size-5 text-purple-500" />} label="Total Views" value={stats.totalViews} />
                        <StatCard icon={<CheckCircle className="size-5 text-orange-500" />} label="Avg Completion" value={`${stats.avgCompletionRate}%`} />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Unable to load stats.</p>
                )}

                {/* Recent forms */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium">Recent Forms</h2>
                        <Link href="/dashboard/forms"><Button variant="ghost" size="sm">View all <ArrowRight className="ml-1 size-4" /></Button></Link>
                    </div>
                    {formsLoading ? (
                        <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
                    ) : recentForms.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {recentForms.map((form) => (
                                <Link key={form.id} href={`/dashboard/forms/${form.id}`} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
                                    <div>
                                        <p className="text-sm font-medium">{form.title}</p>
                                        <p className="text-xs text-muted-foreground">{form.status === "PUBLISHED" ? "Live" : "Draft"} · {form.createdAt ? new Date(form.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</p>
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8">
                            <p className="text-sm text-muted-foreground">No forms yet.</p>
                            <Link href="/dashboard/forms"><Button size="sm"><Plus className="mr-1 size-4" /> Create your first form</Button></Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-3xl font-bold tracking-tight" aria-label={`${label}: ${value}`}>{value}</p>
        </div>
    );
}
