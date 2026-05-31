"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useListCategories, useListTemplates, useCloneTemplate } from "~/hooks/api/template";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Search, Copy, LayoutTemplate } from "~/components/icons";
import { EmptyState } from "~/components/ui/empty-state";
import { FadeIn } from "~/components/motion";

export default function TemplatesPage() {
    const router = useRouter();
    const { categories } = useListCategories();
    const [categoryId, setCategoryId] = useState<string | undefined>();
    const [search, setSearch] = useState("");
    const { templates, isLoading } = useListTemplates({ categoryId, search: search || undefined });
    const { cloneTemplateAsync, isPending: cloning } = useCloneTemplate();

    const handleClone = async (templateId: string) => {
        try {
            const result = await cloneTemplateAsync({ templateId });
            toast.success("Template added to your forms");
            router.push(`/dashboard/forms/${result.id}`);
        } catch {
            toast.error("Couldn't use this template. Please try again.");
        }
    };

    return (
        <div className="px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <FadeIn>
                    <div className="relative overflow-hidden rounded-2xl border border-border/60">
                        <Image
                            src="/landing/jp-4.jpg"
                            alt="A quiet Japanese town street at golden hour"
                            fill
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
                        <div className="px-5 py-7 sm:px-7 sm:py-9">
                            <h1 className="font-display text-3xl font-semibold tracking-tight text-white">Template Gallery</h1>
                            <p className="mt-1 text-sm text-white/75">Start with a pre-built form and customize it to your needs.</p>
                        </div>
                    </div>
                </FadeIn>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant={!categoryId ? "default" : "outline"} size="sm" onClick={() => setCategoryId(undefined)}>All</Button>
                    {categories?.map((cat) => (
                        <Button key={cat.id} variant={categoryId === cat.id ? "default" : "outline"} size="sm" onClick={() => setCategoryId(cat.id)}>
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {templates?.map((t) => (
                            <Card key={t.id} className="group transition-colors hover:border-primary/40">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{t.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {t.description && <p className="line-clamp-2 text-sm text-muted-foreground">{t.description}</p>}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {t.isSystemTemplate && <Badge variant="secondary" className="text-xs">Official</Badge>}
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Copy className="size-3" />{t.templateCloneCount}</span>
                                        </div>
                                        <Button size="sm" onClick={() => handleClone(t.id)} disabled={cloning}>Use Template</Button>
                                    </div>
                                    {t.creatorName && <p className="text-xs text-muted-foreground">by {t.creatorName}</p>}
                                </CardContent>
                            </Card>
                        ))}
                        {templates?.length === 0 && (
                            <div className="col-span-full">
                                <EmptyState
                                    icon={<LayoutTemplate className="size-5" />}
                                    title="No templates found"
                                    description="Try a different category or search term."
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
