"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, PencilLine, Copy, Archive, ArchiveRestore, MoreVertical, Sparkles, Loader2, Building2, ArrowRightLeft } from "~/components/icons";
import { toast } from "sonner";

import { useCreateForm, useListForms, useCloneForm, useArchiveForm, useGenerateForm, useMoveForm } from "~/hooks/api/form";
import { useListWorkspaces } from "~/hooks/api/workspace";

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
const formCardVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit:   { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

const formCardHoverVariants: Variants = {
    rest:  { y: 0 },
    hover: { y: -2, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const WC_TRANSFORM:          CSSProperties = { willChange: "transform" };
const WC_OPACITY_TRANSFORM:  CSSProperties = { willChange: "opacity, transform" };

export default function DashboardForms() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");

    const { workspaces } = useListWorkspaces();
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | undefined>();

    const { createFormAsync, error, status } = useCreateForm();
    const { forms, isLoading } = useListForms(true, activeWorkspaceId);
    const { cloneFormAsync, isPending: cloning } = useCloneForm();
    const { archiveFormAsync, isPending: archiving } = useArchiveForm();
    const { generateFormAsync, isPending: generating, error: aiError } = useGenerateForm();
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

    const handleClone = async (formId: string) => {
        await cloneFormAsync({ formId });
        toast.success("Form cloned successfully");
    };

    const handleArchive = async (formId: string, archive: boolean) => {
        await archiveFormAsync({ formId, archive });
        toast.success(archive ? "Form archived" : "Form restored");
    };

    const handleMove = async (formId: string, workspaceId: string | null) => {
        await moveFormAsync({ formId, workspaceId });
        toast.success(workspaceId ? "Form moved to workspace" : "Form moved to personal");
    };

    const activeForms = forms?.filter((f) => !f.isArchived) ?? [];
    const archivedForms = forms?.filter((f) => f.isArchived) ?? [];

    return (
        <div className="px-6 py-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
                        {workspaces && workspaces.length > 0 && (
                            <div className="mt-3 flex items-center gap-1 rounded-lg border border-border/60 bg-muted/50 p-1">
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
                    <div className="flex items-center gap-2">
                        {/* AI Generate Dialog */}
                        <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
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
                                        <p className="text-xs text-muted-foreground">Be specific — mention the purpose, audience, and any key questions you want included.</p>
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

                        {/* Manual Create Dialog */}
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
                                    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8">
                                        <p className="text-sm text-muted-foreground">No forms yet. Create one to get started.</p>
                                    </div>
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
                                    <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No archived forms.</p>
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
                        <div className="flex items-center gap-2">
                            <h2 className="truncate text-sm font-semibold">{form.title}</h2>
                            <div className={`flex size-1.5 shrink-0 rounded-full ${isLive ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                            <Badge variant={isLive ? "default" : "secondary"} className="shrink-0 text-xs py-0">
                                {isLive ? "Live" : "Draft"}
                            </Badge>
                            {wsName && (
                                <Badge variant="outline" className="shrink-0 text-xs py-0 gap-1">
                                    <Building2 className="size-2.5" />{wsName}
                                </Badge>
                            )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{form.description || "No description"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/80">
                            {form.createdAt ? new Date(form.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Button asChild variant="ghost" size="icon" className="size-8" aria-label="View submissions">
                        <Link href={`/form/${form.id}/submissions`}><Eye className="size-3.5" /></Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="size-8" aria-label="Edit form">
                        <Link href={`/dashboard/forms/${form.id}`}><PencilLine className="size-3.5" /></Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" aria-label="More options">
                                <MoreVertical className="size-3.5" />
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
