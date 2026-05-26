"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Copy, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useListPublicForms, useClonePublicForm } from "~/hooks/api/form";
import { useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function ExplorePage() {
    const { data: user } = useUser();
    const { forms: allForms, isLoading: loadingAll } = useListPublicForms(false);
    const { forms: templates, isLoading: loadingTemplates } = useListPublicForms(true);
    const { clonePublicFormAsync, isPending: cloning } = useClonePublicForm();

    const handleUseTemplate = async (formId: string) => {
        if (!user?.id) {
            toast.error("Sign in to use templates");
            return;
        }
        await clonePublicFormAsync({ formId });
        toast.success("Template cloned to your forms!");
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <Link href="/" className="text-lg font-bold">ChaiForms</Link>
                    <nav className="flex items-center gap-3">
                        {user?.id ? (
                            <Button asChild variant="outline" size="sm"><Link href="/dashboard">Dashboard</Link></Button>
                        ) : (
                            <Button asChild size="sm"><Link href="/signin">Sign In</Link></Button>
                        )}
                    </nav>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Explore Forms</h1>
                    <p className="mt-2 text-muted-foreground">Browse public forms and templates. Use any template to kickstart your own form.</p>
                </div>

                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All Forms</TabsTrigger>
                        <TabsTrigger value="templates"><Sparkles className="mr-1 size-4" /> Templates</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        {loadingAll ? <LoadingSkeleton /> : (
                            <FormGrid forms={allForms ?? []} user={user} onUseTemplate={handleUseTemplate} cloning={cloning} />
                        )}
                    </TabsContent>

                    <TabsContent value="templates" className="mt-6">
                        {loadingTemplates ? <LoadingSkeleton /> : (
                            <FormGrid forms={templates ?? []} user={user} onUseTemplate={handleUseTemplate} cloning={cloning} />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}

type PublicForm = { id: string; title: string; description?: string | null; slug?: string | null; isTemplate: boolean; createdAt: Date | null; creatorName?: string | null };

function FormGrid({ forms, user, onUseTemplate, cloning }: { forms: PublicForm[]; user: { id: string } | undefined | null; onUseTemplate: (id: string) => void; cloning: boolean }) {
    if (forms.length === 0) {
        return <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No public forms available yet.</p>;
    }
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
                <div key={form.id} className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium leading-tight">{form.title}</h3>
                            {form.isTemplate && <Badge variant="secondary" className="shrink-0"><Sparkles className="mr-1 size-3" /> Template</Badge>}
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{form.description || "No description"}</p>
                        {form.creatorName && <p className="text-xs text-muted-foreground/60">by {form.creatorName}</p>}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/form/${form.slug ?? form.id}`}>Fill Form <ArrowRight className="ml-1 size-3" /></Link>
                        </Button>
                        {user?.id && (
                            <Button variant="ghost" size="sm" onClick={() => onUseTemplate(form.id)} disabled={cloning} aria-label="Use as template">
                                <Copy className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
    );
}
