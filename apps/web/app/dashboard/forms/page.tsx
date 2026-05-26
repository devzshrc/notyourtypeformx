"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, PencilLine, Copy, Archive, ArchiveRestore, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { useCreateForm, useListForms, useCloneForm, useArchiveForm } from "~/hooks/api/form";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function DashboardForms() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const { createFormAsync, error, status } = useCreateForm();
    const { forms, isLoading } = useListForms(true);
    const { cloneFormAsync, isPending: cloning } = useCloneForm();
    const { archiveFormAsync, isPending: archiving } = useArchiveForm();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await createFormAsync({ title: title.trim(), description: description.trim() || undefined });
        setOpen(false);
        setTitle("");
        setDescription("");
    };

    const handleClone = async (formId: string) => {
        await cloneFormAsync({ formId });
        toast.success("Form cloned successfully");
    };

    const handleArchive = async (formId: string, archive: boolean) => {
        await archiveFormAsync({ formId, archive });
        toast.success(archive ? "Form archived" : "Form restored");
    };

    const activeForms = forms?.filter((f) => !f.isArchived) ?? [];
    const archivedForms = forms?.filter((f) => f.isArchived) ?? [];

    return (
        <div className="px-6 py-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild><Button>Create Form</Button></DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create Form</DialogTitle>
                                <DialogDescription>Add a title and optional description.</DialogDescription>
                            </DialogHeader>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="form-title">Title</Label>
                                    <Input id="form-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Form title" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="form-desc">Description</Label>
                                    <Textarea id="form-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="min-h-24" />
                                </div>
                                {error && <p className="text-sm text-destructive" role="alert">{error.message}</p>}
                                <DialogFooter><Button type="submit" disabled={status === "pending" || title.trim().length === 0}>{status === "pending" ? "Creating..." : "Create"}</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
                ) : (
                    <Tabs defaultValue="active">
                        <TabsList>
                            <TabsTrigger value="active">Active{activeForms.length > 0 && ` (${activeForms.length})`}</TabsTrigger>
                            <TabsTrigger value="archived">Archived{archivedForms.length > 0 && ` (${archivedForms.length})`}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="active" className="mt-4">
                            {activeForms.length > 0 ? (
                                <div className="grid gap-3" role="list">{activeForms.map((form) => <FormCard key={form.id} form={form} onClone={handleClone} onArchive={handleArchive} cloning={cloning} archiving={archiving} />)}</div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8">
                                    <p className="text-sm text-muted-foreground">No forms yet. Create one to get started.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="archived" className="mt-4">
                            {archivedForms.length > 0 ? (
                                <div className="grid gap-3" role="list">{archivedForms.map((form) => <FormCard key={form.id} form={form} onClone={handleClone} onArchive={handleArchive} cloning={cloning} archiving={archiving} />)}</div>
                            ) : (
                                <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No archived forms.</p>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}

type FormItem = { id: string; title: string; description?: string | null; status: "DRAFT" | "PUBLISHED"; isArchived: boolean; createdAt: Date | null };

function FormCard({ form, onClone, onArchive, cloning, archiving }: { form: FormItem; onClone: (id: string) => void; onArchive: (id: string, archive: boolean) => void; cloning: boolean; archiving: boolean }) {
    return (
        <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/30" role="listitem">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="truncate text-base font-medium">{form.title}</h2>
                        <Badge variant={form.status === "PUBLISHED" ? "default" : "secondary"} className="shrink-0">{form.status === "PUBLISHED" ? "Live" : "Draft"}</Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{form.description || "No description"}</p>
                    <span className="block text-xs text-muted-foreground/60">{form.createdAt ? new Date(form.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="View submissions"><Link href={`/form/${form.id}/submissions`}><Eye className="size-4" /></Link></Button>
                    <Button asChild variant="ghost" size="icon" aria-label="Edit form"><Link href={`/dashboard/forms/${form.id}`}><PencilLine className="size-4" /></Link></Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More options"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onClone(form.id)} disabled={cloning}><Copy className="mr-2 size-4" /> Clone</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onArchive(form.id, !form.isArchived)} disabled={archiving}>
                                {form.isArchived ? <><ArchiveRestore className="mr-2 size-4" /> Restore</> : <><Archive className="mr-2 size-4" /> Archive</>}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
