"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListCategories, useListTemplates, useCloneTemplate } from "~/hooks/api/template";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Search, Copy } from "lucide-react";

export default function TemplatesPage() {
    const router = useRouter();
    const { categories } = useListCategories();
    const [categoryId, setCategoryId] = useState<string | undefined>();
    const [search, setSearch] = useState("");
    const { templates, isLoading } = useListTemplates({ categoryId, search: search || undefined });
    const { cloneTemplateAsync, isPending: cloning } = useCloneTemplate();

    const handleClone = async (templateId: string) => {
        const result = await cloneTemplateAsync({ templateId });
        router.push(`/dashboard/forms/${result.id}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Template Gallery</h1>
                    <p className="text-muted-foreground mt-1">Start with a pre-built form and customize it to your needs</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button variant={!categoryId ? "default" : "outline"} size="sm" onClick={() => setCategoryId(undefined)}>All</Button>
                    {categories?.map((cat) => (
                        <Button key={cat.id} variant={categoryId === cat.id ? "default" : "outline"} size="sm" onClick={() => setCategoryId(cat.id)}>
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {isLoading ? (
                    <p className="text-muted-foreground">Loading templates...</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {templates?.map((t) => (
                            <Card key={t.id} className="group hover:border-primary/40 transition-colors">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{t.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {t.description && <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {t.isSystemTemplate && <Badge variant="secondary" className="text-xs">Official</Badge>}
                                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Copy className="size-3" />{t.templateCloneCount}</span>
                                        </div>
                                        <Button size="sm" onClick={() => handleClone(t.id)} disabled={cloning}>
                                            Use Template
                                        </Button>
                                    </div>
                                    {t.creatorName && <p className="text-xs text-muted-foreground">by {t.creatorName}</p>}
                                </CardContent>
                            </Card>
                        ))}
                        {templates?.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No templates found</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
