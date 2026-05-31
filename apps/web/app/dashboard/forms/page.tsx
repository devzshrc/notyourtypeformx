"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, PencilLine, Copy, Archive, ArchiveRestore, MoreVertical, Sparkles, Loader2, Building2, ArrowRightLeft, FileText, Download } from "~/components/icons";
import { EmptyState } from "~/components/ui/empty-state";
import { formatRelativeTime, formatAbsoluteTime } from "~/lib/utils";
import { toast } from "sonner";

import { useCreateForm, useListForms, useCloneForm, useArchiveForm, useGenerateForm, useImportGoogleForm, useMoveForm } from "~/hooks/api/form";
import { useListWorkspaces } from "~/hooks/api/workspace";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { StatusSeal } from "~/components/ui/status-seal";
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
import {
    motion,
    AnimatePresence,
    FadeIn,
    StaggerList,
    StaggerItem,
    useReducedMotion,
    type Variants,
} from "~/components/motion";
import type { CSSProperties } from "react";

// ─── Module-level variants ────────────────────────────────────────────────────
const formCardHoverVariants: Variants = {
    rest:  { y: 0 },
    hover: { y: -2, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const WC_TRANSFORM: CSSProperties = { willChange: "transform" };

export default function DashboardForms() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);

    // Command palette deep-links here with ?new=1 to open the create dialog.
    useEffect(() => {
        if (searchParams.get("new") === "1") {
            setOpen(true);
            router.replace("/dashboard/forms");
        }
    }, [searchParams, router]);
    const [aiOpen, setAiOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [importUrl, setImportUrl] = useState("");

    const { workspaces } = useListWorkspaces();
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | undefined>();

    const { createFormAsync, error, status } = useCreateForm();
    const { forms, isLoading } = useListForms(true, activeWorkspaceId);
    const { cloneFormAsync, isPending: cloning } = useCloneForm();
    const { archiveFormAsync, isPending: archiving } = useArchiveForm();
    const { generateFormAsync, isPending: generating, error: aiError } = useGenerateForm();
    const { importGoogleFormAsync, isPending: importing, error: importError } = useImportGoogleForm();
    const { moveFormAsync } = useMoveForm();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await createFormAsync({ title: title.trim(), description: description.trim() || undefined, workspaceId: activeWorkspaceId });
        setOpen(false);
        setTitle("");
        setDescription("");
    };

    const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const { id } = await generateFormAsync({ prompt: aiPrompt.trim() });
            setAiOpen(false);
            setAiPrompt("");
            toast.success("Form generated! Redirecting to editor...");
            router.push(`/dashboard/forms/${id}`);
        } catch {
            // error shown inline
        }
    };

    const handleImport = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const { id, importedCount, skipped } = await importGoogleFormAsync({ url: importUrl.trim(), workspaceId: activeWorkspaceId });
            setImportOpen(false);
            setImportUrl("");
            toast.success(`Imported ${importedCount} question${importedCount === 1 ? "" : "s"}. Redirecting to editor...`);
            if (skipped.length > 0) toast.warning(`Skipped ${skipped.length} unsupported item${skipped.length === 1 ? "" : "s"} (grids, file upload, or media).`);
            router.push(`/dashboard/forms/${id}`);
        } catch {
            // error shown inline
        }
    };

    const handleClone = async (formId: string) => {
        await cloneFormAsync({ formId });
        toast.success("Form cloned successfully");
    };

    const handleArchive = async (formId: string, archive: boolean) => {
        await archiveFormAsync({ formId, archive });
        toast.success(archive ? "Form archived" : "Form restored", {
            action: {
                label: "Undo",
                onClick: () => {
                    archiveFormAsync({ formId, archive: !archive })
                        .then(() => toast.success(archive ? "Form restored" : "Form archived"))
                        .catch(() => toast.error("Couldn't undo"));
                },
            },
        });
    };

    const handleMove = async (formId: string, workspaceId: string | null) => {
        await moveFormAsync({ formId, workspaceId });
        toast.success(workspaceId ? "Form moved to workspace" : "Form moved to personal");
    };

    const activeForms = forms?.filter((f) => !f.isArchived) ?? [];
    const archivedForms = forms?.filter((f) => f.isArchived) ?? [];

    return (
        <div className="px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-semibold tracking-tight">Forms</h1>
                        {workspaces && workspaces.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-muted/50 p-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveWorkspaceId(undefined)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${!activeWorkspaceId ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    All forms
                                </button>
                                {workspaces.map((ws) => (
                                    <button
                                        key={ws.id}
                                        type="button"
                                        onClick={() => setActiveWorkspaceId(ws.id)}
                                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${activeWorkspaceId === ws.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {ws.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center">
                        {/* AI Generate Dialog */}
                        <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full gap-2 sm:w-auto">
                                    <Sparkles className="size-4 text-primary" />
                                    Generate with AI
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2"><Sparkles className="size-5 text-primary" /> Generate Form with AI</DialogTitle>
                                    <DialogDescription>Describe the form you need. AI will create fields, options, and structure automatically.</DialogDescription>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleGenerate}>
                                    <div className="space-y-2">
                                        <Label htmlFor="ai-prompt">Form description</Label>
                                        <Textarea
                                            id="ai-prompt"
                                            required
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="e.g. Customer feedback survey for a coffee shop, job application form for a software engineer role, event registration form for a tech conference..."
                                            className="min-h-28 resize-none"
                                            disabled={generating}
                                        />
                                        <p className="text-xs text-muted-foreground">Be specific. Mention the purpose, audience, and any key questions you want included.</p>
                                    </div>
                                    {aiError && <p className="text-sm text-destructive" role="alert">{aiError.message}</p>}
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setAiOpen(false)} disabled={generating}>Cancel</Button>
                                        <Button type="submit" disabled={generating || aiPrompt.trim().length < 10} className="gap-2">
                                            {generating ? <><Loader2 className="size-4 animate-spin" /> Generating...</> : <><Sparkles className="size-4" /> Generate</>}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Import from Google Forms Dialog */}
                        <Dialog open={importOpen} onOpenChange={setImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full gap-2 sm:w-auto">
                                    <Download className="size-4 text-primary" />
                                    Import from Google Forms
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2"><Download className="size-5 text-primary" /> Import from Google Forms</DialogTitle>
                                    <DialogDescription>Paste a public Google Form link. We&apos;ll import its title, questions, types, and options as a new draft.</DialogDescription>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleImport}>
                                    <div className="space-y-2">
                                        <Label htmlFor="import-url">Google Form link</Label>
                                        <Input
                                            id="import-url"
                                            type="url"
                                            required
                                            value={importUrl}
                                            onChange={(e) => setImportUrl(e.target.value)}
                                            placeholder="https://docs.google.com/forms/d/e/.../viewform"
                                            disabled={importing}
                                        />
                                        <p className="text-xs text-muted-foreground">Open your form in Google Forms → Send → link tab, and paste the responder (/viewform) URL. Link sharing must be on. Grids, file uploads, and media are skipped.</p>
                                    </div>
                                    {importError && <p className="text-sm text-destructive" role="alert">{importError.message}</p>}
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setImportOpen(false)} disabled={importing}>Cancel</Button>
                                        <Button type="submit" disabled={importing || importUrl.trim().length === 0} className="gap-2">
                                            {importing ? <><Loader2 className="size-4 animate-spin" /> Importing...</> : <><Download className="size-4" /> Import</>}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Manual Create Dialog */}
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild><Button className="w-full sm:w-auto">Create Form</Button></DialogTrigger>
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
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
                ) : (
                    <FadeIn delay={0.05}>
                        <Tabs defaultValue="active">
                            <TabsList>
                                <TabsTrigger value="active">Active{activeForms.length > 0 && ` (${activeForms.length})`}</TabsTrigger>
                                <TabsTrigger value="archived">Archived{archivedForms.length > 0 && ` (${archivedForms.length})`}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="active" className="mt-4">
                                {activeForms.length > 0 ? (
                                    <StaggerList className="grid gap-3">
                                        <AnimatePresence>
                                            {activeForms.map((form) => (
                                                <StaggerItem key={form.id}>
                                                    <FormCard form={form} onClone={handleClone} onArchive={handleArchive} onMove={handleMove} cloning={cloning} archiving={archiving} workspaces={workspaces ?? []} />
                                                </StaggerItem>
                                            ))}
                                        </AnimatePresence>
                                    </StaggerList>
                                ) : (
                                    <EmptyState
                                        icon={<FileText className="size-5" />}
                                        title="No forms yet"
                                        description="Create your first form to start collecting responses."
                                    />
                                )}
                            </TabsContent>
                            <TabsContent value="archived" className="mt-4">
                                {archivedForms.length > 0 ? (
                                    <StaggerList className="grid gap-3">
                                        <AnimatePresence>
                                            {archivedForms.map((form) => (
                                                <StaggerItem key={form.id}>
                                                    <FormCard form={form} onClone={handleClone} onArchive={handleArchive} onMove={handleMove} cloning={cloning} archiving={archiving} workspaces={workspaces ?? []} />
                                                </StaggerItem>
                                            ))}
                                        </AnimatePresence>
                                    </StaggerList>
                                ) : (
                                    <EmptyState
                                        icon={<Archive className="size-5" />}
                                        title="No archived forms"
                                        description="Forms you archive will appear here."
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    </FadeIn>
                )}
            </div>
        </div>
    );
}

type FormItem = { id: string; title: string; description?: string | null; status: "DRAFT" | "PUBLISHED"; isArchived: boolean; createdAt: Date | string | null; workspaceId?: string | null };
type WorkspaceItem = { id: string; name: string };

function FormCard({ form, onClone, onArchive, onMove, cloning, archiving, workspaces }: { form: FormItem; onClone: (id: string) => void; onArchive: (id: string, archive: boolean) => void; onMove: (id: string, wsId: string | null) => void; cloning: boolean; archiving: boolean; workspaces: WorkspaceItem[] }) {
    const isLive = form.status === "PUBLISHED";
     
    const shouldReduce = useReducedMotion();
    const wsName = workspaces.find((ws) => ws.id === form.workspaceId)?.name;
    return (
        <motion.div
            initial="rest"
            whileHover={shouldReduce ? "rest" : "hover"}
            animate="rest"
            variants={formCardHoverVariants}
            style={WC_TRANSFORM}
            className="group rounded-xl border border-border/60 bg-card px-5 py-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-shadow duration-150"
            role="listitem"
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <PencilLine className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                            <h2 className="truncate text-sm font-semibold">{form.title}</h2>
                            <StatusSeal
                                status={form.isArchived ? "ARCHIVED" : isLive ? "PUBLISHED" : "DRAFT"}
                                className="shrink-0"
                            />
                            {wsName && (
                                <Badge variant="outline" className="hidden shrink-0 gap-1 py-0 text-xs sm:inline-flex">
                                    <Building2 className="size-2.5" />{wsName}
                                </Badge>
                            )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{form.description || "No description"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/80" title={formatAbsoluteTime(form.createdAt)}>
                            {form.createdAt ? `Created ${formatRelativeTime(form.createdAt)}` : ""}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5">
                        <Link href={`/dashboard/forms/${form.id}/responses`}><Eye className="size-4" /> <span className="hidden sm:inline">Responses</span></Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                        <Link href={`/dashboard/forms/${form.id}`}><PencilLine className="size-4" /> <span className="hidden sm:inline">Edit</span></Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" aria-label="More options">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-36">
                            <DropdownMenuItem onClick={() => onClone(form.id)} disabled={cloning}>
                                <Copy className="mr-2 size-3.5" /> Clone
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onArchive(form.id, !form.isArchived)} disabled={archiving}>
                                {form.isArchived
                                    ? <><ArchiveRestore className="mr-2 size-3.5" /> Restore</>
                                    : <><Archive className="mr-2 size-3.5" /> Archive</>}
                            </DropdownMenuItem>
                            {workspaces.length > 0 && (
                                <>
                                    {form.workspaceId ? (
                                        <DropdownMenuItem onClick={() => onMove(form.id, null)}>
                                            <ArrowRightLeft className="mr-2 size-3.5" /> Move to Personal
                                        </DropdownMenuItem>
                                    ) : null}
                                    {workspaces.filter((ws) => ws.id !== form.workspaceId).map((ws) => (
                                        <DropdownMenuItem key={ws.id} onClick={() => onMove(form.id, ws.id)}>
                                            <ArrowRightLeft className="mr-2 size-3.5" /> Move to {ws.name}
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.div>
    );
}
