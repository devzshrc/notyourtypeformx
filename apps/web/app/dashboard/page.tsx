"use client";

import Link from "next/link";
import { BarChart3, FileText, Eye, CheckCircle, ArrowRight, Plus } from "~/components/icons";
import { useAdminStats, useListForms } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
    motion,
    FadeIn,
    StaggerList,
    StaggerItem,
    StaggerView,
    StaggerViewItem,
    useReducedMotion,
    type Variants,
} from "~/components/motion";
import type { CSSProperties } from "react";

// ─── Module-level variants ────────────────────────────────────────────────────
const statCardVariants: Variants = {
    rest:  { y: 0 },
    hover: { y: -3, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const statIconVariants: Variants = {
    rest:  { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: -8, transition: { type: "spring", stiffness: 400, damping: 17 } },
};

const formRowVariants: Variants = {
    rest:  { x: 0 },
    hover: { x: 2, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

const arrowVariants: Variants = {
    rest:  { opacity: 0, x: -4 },
    hover: { opacity: 1, x: 0,  transition: { type: "spring", stiffness: 400, damping: 25 } },
};

const WC_TRANSFORM: CSSProperties = { willChange: "transform" };
const WC_OPACITY_TRANSFORM: CSSProperties = { willChange: "opacity, transform" };

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value }: {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    label: string;
    value: string | number;
}) {
    const shouldReduce = useReducedMotion();
    return (
        <motion.div
            initial="rest"
            whileHover={shouldReduce ? "rest" : "hover"}
            animate="rest"
            variants={statCardVariants}
            style={WC_TRANSFORM}
            className="rounded-xl border border-border/60 bg-card p-5 cursor-default"
        >
            <motion.div
                variants={statIconVariants}
                style={WC_TRANSFORM}
                className={`inline-flex size-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
            >
                {icon}
            </motion.div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { stats, isLoading: statsLoading } = useAdminStats();
    const { forms, isLoading: formsLoading } = useListForms();
    const shouldReduce = useReducedMotion();

    const recentForms = (forms ?? []).filter((f) => !f.isArchived).slice(0, 5);

    return (
        <div className="px-6 py-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <FadeIn>
                    <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">Welcome back — here&apos;s what&apos;s happening with your forms.</p>
                </FadeIn>

                {/* Stats */}
                {statsLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
                    </div>
                ) : stats ? (
                    <StaggerList className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StaggerItem><StatCard icon={<FileText className="size-4" />}    iconBg="bg-blue-500/15"   iconColor="text-blue-500"   label="Total Forms"     value={stats.totalForms} /></StaggerItem>
                        <StaggerItem><StatCard icon={<BarChart3 className="size-4" />}   iconBg="bg-green-500/15"  iconColor="text-green-500"  label="Submissions"     value={stats.totalSubmissions} /></StaggerItem>
                        <StaggerItem><StatCard icon={<Eye className="size-4" />}         iconBg="bg-purple-500/15" iconColor="text-purple-500" label="Total Views"     value={stats.totalViews} /></StaggerItem>
                        <StaggerItem><StatCard icon={<CheckCircle className="size-4" />} iconBg="bg-orange-500/15" iconColor="text-orange-500" label="Avg Completion"  value={`${stats.avgCompletionRate}%`} /></StaggerItem>
                    </StaggerList>
                ) : null}

                {/* Recent forms */}
                <section className="flex flex-col gap-4">
                    <FadeIn delay={0.1}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold">Recent Forms</h2>
                                <p className="text-xs text-muted-foreground">{recentForms.length} active form{recentForms.length !== 1 ? "s" : ""}</p>
                            </div>
                            <Link href="/dashboard/forms">
                                <Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ArrowRight className="size-3.5" /></Button>
                            </Link>
                        </div>
                    </FadeIn>

                    {formsLoading ? (
                        <div className="flex flex-col gap-2">{[1,2,3].map(i => <Skeleton key={i} className="h-[72px] rounded-xl" />)}</div>
                    ) : recentForms.length > 0 ? (
                        <StaggerList className="flex flex-col gap-2" delay={0.12}>
                            {recentForms.map((form) => (
                                <StaggerItem key={form.id}>
                                    <Link href={`/dashboard/forms/${form.id}`} className="block">
                                        <motion.div
                                            initial="rest"
                                            whileHover={shouldReduce ? "rest" : "hover"}
                                            animate="rest"
                                            variants={formRowVariants}
                                            style={WC_TRANSFORM}
                                            className="group flex items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-shadow duration-150"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                    <FileText className="size-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">{form.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {form.createdAt ? new Date(form.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3">
                                                <Badge variant={form.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">
                                                    {form.status === "PUBLISHED" ? "Live" : "Draft"}
                                                </Badge>
                                                <motion.div variants={arrowVariants} style={WC_OPACITY_TRANSFORM}>
                                                    <ArrowRight className="size-3.5 text-muted-foreground" />
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </StaggerItem>
                            ))}
                        </StaggerList>
                    ) : (
                        <FadeIn delay={0.15}>
                            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-12 text-center">
                                <motion.div
                                    initial={shouldReduce ? false : { scale: 0.85, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
                                    style={WC_OPACITY_TRANSFORM}
                                    className="flex size-12 items-center justify-center rounded-full bg-primary/10"
                                >
                                    <FileText className="size-5 text-primary" />
                                </motion.div>
                                <div>
                                    <p className="font-medium">No forms yet</p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Create your first form to start collecting responses.</p>
                                </div>
                                <Link href="/dashboard/forms">
                                    <Button size="sm" className="gap-1.5"><Plus className="size-3.5" /> Create form</Button>
                                </Link>
                            </div>
                        </FadeIn>
                    )}
                </section>
            </div>
        </div>
    );
}
