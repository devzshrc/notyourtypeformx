"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    ArrowLeft, Plus, Trash2, Pencil, Copy,
    QrCode, Download, Lock, Clock, Hash, Eye, Globe,
    ClipboardList, ExternalLink, Palette, MagicWand, GripVertical, Loader2,
} from "~/components/icons";
import QRCode from "qrcode";
import {
    useGetForm, useUpdateForm, useListFields,
    useAddField, useUpdateField, useDeleteField, useReorderFields,
    useGetAnalytics, useImproveField, useUpdateSlug, useDeleteForm,
} from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Switch } from "~/components/ui/switch";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "~/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { FORM_THEME_OPTIONS } from "~/lib/form-themes";
import { ThemePreview } from "~/components/theme-preview";
import { useTheme } from "next-themes";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence, type Variants } from "~/components/motion";
import type { CSSProperties } from "react";

// ─── Module-level variants ────────────────────────────────────────────────────
const fieldRowVariants: Variants = {
    hidden: { opacity: 0, x: -8, height: 0 },
    visible: { opacity: 1, x: 0, height: "auto", transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit:   { opacity: 0, x: 8, height: 0, transition: { duration: 0.2 } },
};

const fieldRowHoverVariants: Variants = {
    rest:  { x: 0 },
    hover: { x: 2, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

const WC_OPACITY_TRANSFORM: CSSProperties = { willChange: "opacity, transform" };

const FIELD_TYPES = [
    "TEXT", "LONG_TEXT", "EMAIL", "NUMBER", "PHONE", "WEBSITE", "DATE",
    "YES_NO", "MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "RATING", "PASSWORD", "STATEMENT",
] as const;
type FieldType = (typeof FIELD_TYPES)[number];
const CHOICE_TYPES: FieldType[] = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"];

export default function FormEditorPage() {
    const params = useParams<{ id: string }>();
    const formId = params.id;

    const { form, isLoading: formLoading } = useGetForm(formId);
    const { updateFormAsync, isPending: savingForm } = useUpdateForm();
    const { fields, isLoading: fieldsLoading } = useListFields(formId);
    const { addFieldAsync, isPending: addingField } = useAddField();
    const { updateFieldAsync, isPending: updatingField } = useUpdateField();
    const { deleteFieldAsync } = useDeleteField();
    const { reorderFieldsAsync } = useReorderFields();
    const { analytics } = useGetAnalytics(formId, { refetchInterval: 5000 });
    const { improveFieldAsync, isPending: improvingField, improvingFieldId } = useImproveField(formId);
    const { updateSlugAsync, isPending: savingSlug } = useUpdateSlug();
    const { deleteFormAsync, isPending: deletingForm } = useDeleteForm();
    const router = useRouter();

    // Form meta
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [titleEditing, setTitleEditing] = useState(false);

    // Screens
    const [welcomeTitle, setWelcomeTitle] = useState("");
    const [welcomeDescription, setWelcomeDescription] = useState("");
    const [endingTitle, setEndingTitle] = useState("");
    const [endingDescription, setEndingDescription] = useState("");

    // Settings
    const [expiresAt, setExpiresAt] = useState("");
    const [maxResponses, setMaxResponses] = useState("");
    const [formPassword, setFormPassword] = useState(""); // new password to set (never preloaded)
    const [hasPassword, setHasPassword] = useState(false);
    const [removePassword, setRemovePassword] = useState(false);
    const [hiddenFields, setHiddenFields] = useState<string[]>([]);
    const [redirectUrl, setRedirectUrl] = useState("");
    const [notifyEmail, setNotifyEmail] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [closedMessage, setClosedMessage] = useState("");
    const [selectedTheme, setSelectedTheme] = useState("bold-tech");
    const [slugInput, setSlugInput] = useState("");
    const [hoverTheme, setHoverTheme] = useState<string | null>(null);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    // QR — use callback ref so generation fires when canvas actually mounts in DOM (Share tab lazy-renders)
    const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [qrGenerated, setQrGenerated] = useState(false);
    const [qrFg, setQrFg] = useState("#000000");
    const [qrBg, setQrBg] = useState("#ffffff");
    const qrCallbackRef = useCallback((canvas: HTMLCanvasElement | null) => {
        qrCanvasRef.current = canvas;
        if (!canvas || !form?.status) return;
        if (form.status === "PUBLISHED") {
            const url = `${window.location.origin}/form/${form.slug ?? formId}`;
            QRCode.toCanvas(canvas, url, { width: 160, margin: 2, color: { dark: qrFg, light: qrBg } }, () => setQrGenerated(true));
        }
        // qrFg/qrBg intentionally excluded — color changes are handled by the regen effect below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form?.status, form?.slug, formId]);

    // Redraw QR when colors change (callback ref only fires on mount).
    useEffect(() => {
        const canvas = qrCanvasRef.current;
        if (!canvas || form?.status !== "PUBLISHED") return;
        const url = `${window.location.origin}/form/${form.slug ?? formId}`;
        QRCode.toCanvas(canvas, url, { width: 160, margin: 2, color: { dark: qrFg, light: qrBg } });
    }, [qrFg, qrBg, form?.status, form?.slug, formId]);

    // Embed config (live snippet builder)
    const [embedType, setEmbedType] = useState<"iframe" | "script">("iframe");
    const [embedWidth, setEmbedWidth] = useState("100%");
    const [embedHeight, setEmbedHeight] = useState("600");

    // Field dialog
    const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [fLabel, setFLabel] = useState("");
    const fLabelRef = useRef<HTMLInputElement>(null);
    const [fType, setFType] = useState<FieldType>("TEXT");
    const [fPlaceholder, setFPlaceholder] = useState("");
    const [fDescription, setFDescription] = useState("");
    const [fRequired, setFRequired] = useState(false);
    const [fOptions, setFOptions] = useState<string[]>([]);
    const [fLogic, setFLogic] = useState<Record<string, string>>({});
    const [fScores, setFScores] = useState<Record<string, number>>({});
    const [fValidation, setFValidation] = useState<{ minLength?: number; maxLength?: number; min?: number; max?: number; pattern?: string }>({});

    // Inline label edit
    const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
    const [editingLabelValue, setEditingLabelValue] = useState("");

    // Field search (build tab)
    const [fieldSearch, setFieldSearch] = useState("");

    // Bulk import dialog
    const [bulkImportOpen, setBulkImportOpen] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [bulkProgress, setBulkProgress] = useState<string | null>(null);

    useEffect(() => {
        if (!form) return;
        setWelcomeTitle(form.welcomeTitle ?? "");
        setWelcomeDescription(form.welcomeDescription ?? "");
        setEndingTitle(form.endingTitle ?? "");
        setEndingDescription(form.endingDescription ?? "");
        setExpiresAt(form.expiresAt ? new Date(form.expiresAt).toISOString().slice(0, 16) : "");
        setMaxResponses(form.maxResponses ? String(form.maxResponses) : "");
        setHasPassword(form.hasPassword ?? false);
        setFormPassword("");
        setRemovePassword(false);
        setHiddenFields(form.hiddenFields ?? []);
        setRedirectUrl(form.redirectUrl ?? "");
        setNotifyEmail(form.notifyEmail ?? "");
        setWebhookUrl(form.webhookUrl ?? "");
        setClosedMessage(form.closedMessage ?? "");
        setSelectedTheme(form.theme ?? "bold-tech");
        setSlugInput(form.slug ?? "");
    }, [form]);

    const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const slugValid = slugInput.length >= 3 && slugInput.length <= 80 && SLUG_RE.test(slugInput);
    const handleUpdateSlug = async () => {
        if (!slugValid) { toast.error("Slug must be 3–80 chars: lowercase letters, numbers, hyphens"); return; }
        try {
            await updateSlugAsync({ formId, slug: slugInput });
            toast.success("Link updated");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "That slug is taken");
        }
    };
    const handleDeleteForm = async () => {
        try {
            await deleteFormAsync({ formId });
            toast.success("Form deleted");
            router.push("/dashboard/forms");
        } catch {
            toast.error("Couldn't delete form");
        }
    };


    // Handlers
    const isPublished = form?.status === "PUBLISHED";
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/form/${form?.slug ?? formId}` : "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    // Live embed snippet — iframe (fixed size) or auto-resizing script tag (embed.js).
    const embedCode = !shareUrl
        ? ""
        : embedType === "script"
            ? `<script src="${origin}/embed.js" data-schema-form-id="${form?.slug ?? formId}"></script>`
            : `<iframe src="${shareUrl}?embed=1" width="${embedWidth}" height="${embedHeight}" frameborder="0" style="border:none;max-width:100%"></iframe>`;

    // Social share intents
    const shareText = form?.title ? `Fill out: ${form.title}` : "Fill out this form";
    const enc = encodeURIComponent;
    const socialLinks = {
        x: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${enc(shareText + " " + shareUrl)}`,
        email: `mailto:?subject=${enc(shareText)}&body=${enc(shareUrl)}`,
    };

    const copy = async (text: string, label: string) => { await navigator.clipboard.writeText(text); toast.success(`${label} copied`); };
    const downloadQr = () => { if (!qrCanvasRef.current) return; const a = document.createElement("a"); a.href = qrCanvasRef.current.toDataURL("image/png"); a.download = `${form?.title ?? "form"}-qr.png`; a.click(); };

    const handleUpdateTitle = async () => { if (!editTitle.trim()) return; await updateFormAsync({ formId, title: editTitle.trim(), description: editDescription.trim() || undefined }); setTitleEditing(false); };
    const handlePublishToggle = async () => {
        await updateFormAsync({ formId, status: isPublished ? "DRAFT" : "PUBLISHED" });
        toast.success(isPublished ? "Form unpublished" : "Form published!");
    };
    const handleSaveScreens = async () => { await updateFormAsync({ formId, welcomeTitle: welcomeTitle.trim(), welcomeDescription: welcomeDescription.trim(), endingTitle: endingTitle.trim(), endingDescription: endingDescription.trim() }); toast.success("Screens saved"); };
    const handleSaveSettings = async () => {
        // Password: only send when changed — removing, or setting a new value.
        // Omitting leaves the existing (hashed) password untouched.
        let password: string | null | undefined;
        if (removePassword) password = null;
        else if (formPassword.trim()) password = formPassword.trim();
        await updateFormAsync({
            formId,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            maxResponses: maxResponses ? parseInt(maxResponses) : null,
            ...(password !== undefined ? { password } : {}),
            hiddenFields: hiddenFields.map((h) => h.trim()).filter(Boolean),
            redirectUrl: redirectUrl.trim() || null,
            notifyEmail: notifyEmail.trim() || null,
            webhookUrl: webhookUrl.trim() || null,
            closedMessage: closedMessage.trim() || null,
            theme: selectedTheme,
        });
        // Reflect new state locally without exposing any value.
        if (removePassword) { setHasPassword(false); setRemovePassword(false); }
        else if (formPassword.trim()) { setHasPassword(true); setFormPassword(""); }
        toast.success("Settings saved");
    };

    const openAddDialog = () => { setEditingFieldId(null); setFLabel(""); setFType("TEXT"); setFPlaceholder(""); setFDescription(""); setFRequired(false); setFOptions([]); setFLogic({}); setFScores({}); setFValidation({}); setFieldDialogOpen(true); };
    const openEditDialog = (field: NonNullable<typeof fields>[number]) => { setEditingFieldId(field.id); setFLabel(field.label); setFType(field.type); setFPlaceholder(field.placeholder ?? ""); setFDescription(field.description ?? ""); setFRequired(field.isRequired); setFOptions(field.options ?? []); const map: Record<string, string> = {}; (field.logic ?? []).forEach((r) => (map[r.equals] = r.goTo)); setFLogic(map); setFScores(field.scores ?? {}); setFValidation(field.validation ?? {}); setFieldDialogOpen(true); };

    const handleSubmitField = async (e: FormEvent) => {
        e.preventDefault();
        const options = CHOICE_TYPES.includes(fType) ? fOptions.map((o) => o.trim()).filter(Boolean) : [];
        const canJump = CHOICE_TYPES.includes(fType) || fType === "YES_NO";
        const jumpAnswers = fType === "YES_NO" ? ["yes", "no"] : options;
        const logic = canJump ? Object.entries(fLogic).filter(([eq, goTo]) => goTo && goTo !== "NEXT" && jumpAnswers.includes(eq)).map(([equals, goTo]) => ({ equals, goTo })) : [];
        const scores: Record<string, number> = {};
        if (canJump) { for (const ans of jumpAnswers) { const n = fScores[ans]; if (typeof n === "number" && !Number.isNaN(n)) scores[ans] = n; } }
        // Strip empty validation keys; send null when no rules set.
        const vEntries = Object.entries(fValidation).filter(([, v]) => v != null && !(typeof v === "number" && Number.isNaN(v)) && v !== ("" as unknown));
        const validation = vEntries.length > 0 ? Object.fromEntries(vEntries) : null;
        if (editingFieldId) { await updateFieldAsync({ fieldId: editingFieldId, formId, label: fLabel.trim(), type: fType, placeholder: fPlaceholder.trim() || undefined, description: fDescription.trim() || undefined, isRequired: fRequired, options, logic, scores, validation }); }
        else { await addFieldAsync({ formId, label: fLabel.trim(), type: fType, placeholder: fPlaceholder.trim() || undefined, description: fDescription.trim() || undefined, isRequired: fRequired, index: fields?.length ?? 0, options, logic, scores, validation }); }
        setFieldDialogOpen(false);
    };

    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
    const handleDrop = async (dropIdx: number) => {
        if (dragIdx === null || dragIdx === dropIdx || !fields) { setDragIdx(null); setDragOverIdx(null); return; }
        const ids = fields.map((f) => f.id);
        const [moved] = ids.splice(dragIdx, 1);
        ids.splice(dropIdx, 0, moved!);
        setDragIdx(null);
        setDragOverIdx(null);
        await reorderFieldsAsync({ formId, fieldIds: ids });
    };

    const copyField = async (field: NonNullable<typeof fields>[number]) => {
        const map: Record<string, string> = {};
        (field.logic ?? []).forEach((r) => (map[r.equals] = r.goTo));
        await addFieldAsync({
            formId,
            label: `${field.label} (copy)`.slice(0, 100),
            type: field.type,
            placeholder: field.placeholder ?? undefined,
            isRequired: field.isRequired,
            index: fields?.length ?? 0,
            options: field.options ?? [],
            logic: field.logic ?? [],
            scores: field.scores ?? {},
            validation: field.validation ?? null,
        });
        toast.success("Field duplicated");
    };

    // Bulk import handler
    const handleBulkImport = async () => {
        const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!lines.length) return;
        const baseIndex = fields?.length ?? 0;
        for (let i = 0; i < lines.length; i++) {
            setBulkProgress(`Creating ${i + 1}/${lines.length} fields...`);
            await addFieldAsync({ formId, label: lines[i]!, type: "TEXT", isRequired: false, index: baseIndex + i });
        }
        setBulkProgress(null);
        setBulkText("");
        setBulkImportOpen(false);
        toast.success(`${lines.length} fields added`);
    };

    if (formLoading) return <div className="px-4 py-6 sm:px-6 sm:py-8"><div className="mx-auto max-w-4xl space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div></div>;

    const isChoice = CHOICE_TYPES.includes(fType);
    const canJump = isChoice || fType === "YES_NO";
    const jumpAnswers = fType === "YES_NO" ? ["yes", "no"] : fOptions.map((o) => o.trim()).filter(Boolean);

    // Recall: only fields that come *before* this one can be referenced (their answer
    // exists by the time this question renders). New field → every existing field.
    const recallFields = (() => {
        const list = fields ?? [];
        if (!editingFieldId) return list;
        const i = list.findIndex((f) => f.id === editingFieldId);
        return i === -1 ? list : list.slice(0, i);
    })();

    const insertRecall = (labelKey: string) => {
        const token = `{{${labelKey}}}`;
        const el = fLabelRef.current;
        if (!el) { setFLabel((p) => p + token); return; }
        const start = el.selectionStart ?? fLabel.length;
        const end = el.selectionEnd ?? fLabel.length;
        setFLabel(fLabel.slice(0, start) + token + fLabel.slice(end));
        requestAnimationFrame(() => {
            el.focus();
            const pos = start + token.length;
            el.setSelectionRange(pos, pos);
        });
    };

    return (
        <div className="px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms"><Button variant="ghost" size="icon" aria-label="Back"><ArrowLeft className="size-4" /></Button></Link>
                    <div className="flex-1 min-w-0">
                        {titleEditing ? (
                            <div className="flex flex-wrap gap-2">
                                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full sm:max-w-xs" />
                                <Button size="sm" onClick={handleUpdateTitle}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setTitleEditing(false)}>Cancel</Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h1 className="truncate text-xl font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => { setEditTitle(form?.title ?? ""); setEditDescription(form?.description ?? ""); setTitleEditing(true); }}>
                                    {form?.title} <Pencil className="inline size-3 text-muted-foreground" />
                                </h1>
                                <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Live" : "Draft"}</Badge>
                            </div>
                        )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Link href={`/form/${form?.slug ?? formId}`} target="_blank"><Button variant="outline" size="sm" aria-label="Preview"><Eye className="size-4 sm:mr-1" /> <span className="hidden sm:inline">Preview</span></Button></Link>
                        <Button size="sm" onClick={handlePublishToggle} disabled={savingForm} variant={isPublished ? "secondary" : "default"}>
                            {isPublished ? "Unpublish" : "Publish"}
                        </Button>
                    </div>
                </div>

                {/* Tabbed content */}
                <Tabs defaultValue="build" className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        <TabsTrigger value="build">Build</TabsTrigger>
                        <TabsTrigger value="themes">Themes</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="share">Share</TabsTrigger>
                    </TabsList>

                    {/* BUILD TAB */}
                    <TabsContent value="build" className="mt-6 space-y-6">
                        <motion.div
                            key="build"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="space-y-6"
                        >
                        {/* Fields header with bulk import */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-medium">Questions</h2>
                                <p className="text-sm text-muted-foreground">
                                    {fields?.length ?? 0} field{(fields?.length ?? 0) !== 1 ? "s" : ""}
                                    {(fields?.length ?? 0) > 0 && (
                                        <> · ~{Math.max(1, Math.round((fields!.length * 9) / 60))} min to complete</>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {(fields?.length ?? 0) > 4 && (
                                    <Input
                                        value={fieldSearch}
                                        onChange={(e) => setFieldSearch(e.target.value)}
                                        placeholder="Search fields…"
                                        className="h-9 w-44"
                                    />
                                )}
                                <Button variant="outline" size="sm" onClick={() => setBulkImportOpen(true)}>
                                    <ClipboardList className="mr-1 size-4" /> Import
                                </Button>
                                <Button onClick={openAddDialog}><Plus className="mr-1 size-4" /> Add Field</Button>
                            </div>
                        </div>

                        {fieldsLoading ? (
                            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                        ) : fields && fields.length > 0 ? (
                            <div className="space-y-2">
                                <AnimatePresence initial={false}>
                                {fields
                                    .filter((f) => !fieldSearch.trim() || f.label.toLowerCase().includes(fieldSearch.trim().toLowerCase()))
                                    .map((field) => {
                                    const idx = fields.indexOf(field);
                                    const dragEnabled = !fieldSearch.trim();
                                    return (
                                    <motion.div
                                        key={field.id}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={fieldRowVariants}
                                        style={WC_OPACITY_TRANSFORM}
                                        layout
                                        draggable={dragEnabled}
                                        onDragStart={() => setDragIdx(idx)}
                                        onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                                        onDragLeave={() => setDragOverIdx(null)}
                                        onDrop={() => handleDrop(idx)}
                                        onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                                    >
                                    <motion.div
                                        initial="rest"
                                        whileHover="hover"
                                        animate="rest"
                                        variants={fieldRowHoverVariants}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:shadow-sm transition-all",
                                            dragIdx === idx && "opacity-50",
                                            dragOverIdx === idx && dragIdx !== idx && "border-primary border-dashed bg-primary/5"
                                        )}
                                    >
                                        <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                                            <GripVertical className="size-5" />
                                        </div>
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            {/* Inline label edit */}
                                            {editingLabelId === field.id ? (
                                                <input
                                                    autoFocus
                                                    value={editingLabelValue}
                                                    onChange={(e) => setEditingLabelValue(e.target.value)}
                                                    onBlur={async () => {
                                                        if (editingLabelValue.trim() && editingLabelValue !== field.label) {
                                                            await updateFieldAsync({ fieldId: field.id, formId, label: editingLabelValue.trim() });
                                                        }
                                                        setEditingLabelId(null);
                                                    }}
                                                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                                    className="w-full border-b border-primary bg-transparent text-sm font-medium focus:outline-none"
                                                />
                                            ) : (
                                                <p
                                                    className="truncate text-sm font-medium cursor-text hover:text-primary transition-colors"
                                                    title="Click to edit label"
                                                    onClick={() => { setEditingLabelId(field.id); setEditingLabelValue(field.label); }}
                                                >
                                                    {field.label}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">{field.type.replace(/_/g, " ").toLowerCase()}{field.isRequired && " · required"}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                                            <Button
                                                variant="ghost" size="icon" className="size-8 text-primary hover:text-primary/80"
                                                title="Improve with AI"
                                                disabled={improvingField && improvingFieldId === field.id}
                                                onClick={async () => {
                                                    try {
                                                        await improveFieldAsync({ fieldId: field.id });
                                                        toast.success("Label improved ✨");
                                                    } catch {
                                                        toast.error("AI improve failed");
                                                    }
                                                }}
                                            >
                                                {improvingField && improvingFieldId === field.id
                                                    ? <span className="size-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                                                    : <MagicWand className="size-3.5" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8" title="Duplicate field" onClick={() => copyField(field)}><Copy className="size-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="size-8" title="Edit field" aria-label="Edit field" onClick={() => openEditDialog(field)}><Pencil className="size-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" title="Delete field" aria-label="Delete field" onClick={() => deleteFieldAsync({ fieldId: field.id, formId })}><Trash2 className="size-3.5" /></Button>
                                        </div>
                                    </motion.div>
                                    </motion.div>
                                    );
                                })}
                                </AnimatePresence>
                                {fieldSearch.trim() && fields.filter((f) => f.label.toLowerCase().includes(fieldSearch.trim().toLowerCase())).length === 0 && (
                                    <p className="py-6 text-center text-sm text-muted-foreground">No fields match &ldquo;{fieldSearch}&rdquo;</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-12 text-center">
                                <p className="text-muted-foreground">No questions yet</p>
                                <Button variant="outline" onClick={openAddDialog}><Plus className="mr-1 size-4" /> Add your first question</Button>
                            </div>
                        )}

                        <Separator />

                        {/* Welcome & Ending */}
                        <div>
                            <h2 className="text-base font-medium mb-4">Screens</h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-3 rounded-lg border border-border p-4">
                                    <p className="text-sm font-medium text-muted-foreground">Welcome Screen</p>
                                    <div className="space-y-2">
                                        <Label htmlFor="welcome-title">Title</Label>
                                        <Input id="welcome-title" value={welcomeTitle} onChange={(e) => setWelcomeTitle(e.target.value)} placeholder="Welcome to our form" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="welcome-desc">Description</Label>
                                        <Textarea id="welcome-desc" value={welcomeDescription} onChange={(e) => setWelcomeDescription(e.target.value)} placeholder="Brief intro..." rows={3} />
                                    </div>
                                </div>
                                <div className="space-y-3 rounded-lg border border-border p-4">
                                    <p className="text-sm font-medium text-muted-foreground">Thank You Screen</p>
                                    <div className="space-y-2">
                                        <Label htmlFor="ending-title">Title</Label>
                                        <Input id="ending-title" value={endingTitle} onChange={(e) => setEndingTitle(e.target.value)} placeholder="Thank you!" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ending-desc">Description</Label>
                                        <Textarea id="ending-desc" value={endingDescription} onChange={(e) => setEndingDescription(e.target.value)} placeholder="Your response has been recorded." rows={3} />
                                    </div>
                                </div>
                            </div>
                            <Button className="mt-4 gap-1.5" size="sm" onClick={handleSaveScreens} disabled={savingForm}>{savingForm ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : "Save Screens"}</Button>
                        </div>
                    </motion.div>
                    </TabsContent>

                    {/* THEMES TAB */}
                    <TabsContent value="themes" className="mt-6">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-medium flex items-center gap-2"><Palette className="size-4" /> Form Theme</h2>
                                <p className="text-sm text-muted-foreground">Choose the visual style for your public form</p>
                            </div>
                            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                                {/* Theme grid with live preview thumbnails */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {FORM_THEME_OPTIONS.map((theme) => (
                                        <button
                                            key={theme.value}
                                            type="button"
                                            onMouseEnter={() => setHoverTheme(theme.value)}
                                            onMouseLeave={() => setHoverTheme(null)}
                                            onFocus={() => setHoverTheme(theme.value)}
                                            onBlur={() => setHoverTheme(null)}
                                            onClick={async () => {
                                                setSelectedTheme(theme.value);
                                                await updateFormAsync({ formId, theme: theme.value });
                                                toast.success(`Theme set to ${theme.label}`);
                                            }}
                                            className={cn(
                                                "relative flex flex-col gap-3 rounded-xl border-2 p-3 text-left transition-all hover:shadow-md",
                                                selectedTheme === theme.value
                                                    ? "border-primary"
                                                    : "border-border hover:border-primary/40"
                                            )}
                                        >
                                            <ThemePreview theme={theme.value} isDark={isDark} />
                                            <div className="flex items-center gap-2.5">
                                                {theme.kanji && (
                                                    <span
                                                        aria-hidden
                                                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-lg"
                                                        style={{ color: theme.primaryColor, backgroundColor: `color-mix(in oklch, ${theme.primaryColor} 14%, transparent)` }}
                                                    >
                                                        {theme.kanji}
                                                    </span>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold">{theme.label}</p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">{theme.description}</p>
                                                </div>
                                            </div>
                                            {selectedTheme === theme.value && (
                                                <span className="absolute right-3 top-3 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Sticky live preview — follows hover, falls back to selected */}
                                <div className="lg:sticky lg:top-6 lg:self-start">
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
                                    <ThemePreview
                                        theme={hoverTheme ?? selectedTheme}
                                        isDark={isDark}
                                        className="shadow-sm"
                                    />
                                    <p className="mt-2 text-center text-xs text-muted-foreground">
                                        {FORM_THEME_OPTIONS.find((t) => t.value === (hoverTheme ?? selectedTheme))?.label ?? "Preview"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SETTINGS TAB */}
                    <TabsContent value="settings" className="mt-6 space-y-8">
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="space-y-8"
                        >

                        {/* Custom slug */}
                        <div>
                            <h2 className="text-base font-medium flex items-center gap-2"><Globe className="size-4" /> Custom Link</h2>
                            <p className="text-sm text-muted-foreground mb-4">Set a friendly URL for your public form</p>
                            <div className="flex max-w-xl items-end gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="form-slug">Slug</Label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm text-muted-foreground">/f/</span>
                                        <Input
                                            id="form-slug"
                                            value={slugInput}
                                            onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                            placeholder="my-survey"
                                            className="font-mono"
                                        />
                                    </div>
                                    {slugInput && !slugValid && (
                                        <p className="text-xs text-destructive">3–80 chars: lowercase letters, numbers, hyphens (no leading/trailing/double hyphen)</p>
                                    )}
                                </div>
                                <Button onClick={handleUpdateSlug} disabled={savingSlug || !slugValid || slugInput === (form?.slug ?? "")}>
                                    {savingSlug ? <Loader2 className="size-4 animate-spin" /> : "Update"}
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Redirect URL */}
                        <div>
                            <h2 className="text-base font-medium flex items-center gap-2"><ExternalLink className="size-4" /> Custom Redirect</h2>
                            <p className="text-sm text-muted-foreground mb-4">After submission, redirect respondents to a custom URL instead of showing the thank-you screen</p>
                            <div className="max-w-md space-y-2">
                                <Label htmlFor="redirect-url">Redirect URL</Label>
                                <Input
                                    id="redirect-url"
                                    type="url"
                                    value={redirectUrl}
                                    onChange={(e) => setRedirectUrl(e.target.value)}
                                    placeholder="https://your-site.com/thank-you"
                                />
                                <p className="text-xs text-muted-foreground">Leave empty to show the ending screen</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h2 className="text-base font-medium">Access Control</h2>
                            <p className="text-sm text-muted-foreground mb-4">Control who can access and submit this form</p>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="set-password" className="flex items-center gap-2"><Lock className="size-4" /> Password Protection</Label>
                                    {hasPassword && !removePassword ? (
                                        <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                                            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-500"><Lock className="size-3.5" /> Password protected</span>
                                            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => { setRemovePassword(true); setFormPassword(""); }}>Remove</Button>
                                        </div>
                                    ) : (
                                        <Input id="set-password" type="password" autoComplete="new-password" value={formPassword} onChange={(e) => { setFormPassword(e.target.value); setRemovePassword(false); }} placeholder={hasPassword ? "Removed — save to confirm" : "Set a password"} />
                                    )}
                                    <p className="text-xs text-muted-foreground">{hasPassword && !removePassword ? "Respondents must enter this password. Type to change it, or remove it." : "Respondents must enter this password before filling the form"}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="set-max" className="flex items-center gap-2"><Hash className="size-4" /> Response Limit</Label>
                                    <Input id="set-max" type="number" min="1" value={maxResponses} onChange={(e) => setMaxResponses(e.target.value)} placeholder="Unlimited" />
                                    <p className="text-xs text-muted-foreground">Stop accepting responses after this many submissions</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h2 className="text-base font-medium">Scheduling</h2>
                            <p className="text-sm text-muted-foreground mb-4">Set when the form stops accepting responses</p>
                            <div className="max-w-xs space-y-2">
                                <Label htmlFor="set-expiry" className="flex items-center gap-2"><Clock className="size-4" /> Expiry Date & Time</Label>
                                <Input id="set-expiry" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Form will stop accepting responses after this time</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h2 className="text-base font-medium">Hidden Fields</h2>
                            <p className="text-sm text-muted-foreground mb-4">Capture URL query parameters (e.g. <code className="rounded bg-muted px-1 text-xs">?utm_source=twitter</code>)</p>
                            <div className="space-y-2 max-w-md">
                                {hiddenFields.map((h, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input value={h} onChange={(e) => setHiddenFields((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))} placeholder="e.g. utm_source" />
                                        <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => setHiddenFields((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => setHiddenFields((p) => [...p, ""])}><Plus className="mr-1 size-3" /> Add Field</Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Notifications & integrations */}
                        <div>
                            <h2 className="text-base font-medium">Notifications &amp; Integrations</h2>
                            <p className="text-sm text-muted-foreground mb-4">Get notified and forward responses when someone submits</p>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="notify-email">Email notification</Label>
                                    <Input id="notify-email" type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="you@example.com" />
                                    <p className="text-xs text-muted-foreground">Receive an email with each new response</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="webhook-url">Webhook URL</Label>
                                    <Input id="webhook-url" type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.example.com/..." />
                                    <p className="text-xs text-muted-foreground">POST each response as JSON (Zapier, Make, your API)</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Closed message */}
                        <div>
                            <h2 className="text-base font-medium">Closed Message</h2>
                            <p className="text-sm text-muted-foreground mb-4">Shown when the form is unpublished, expired, or hit its response limit</p>
                            <div className="max-w-md space-y-2">
                                <Label htmlFor="closed-message">Message</Label>
                                <Textarea id="closed-message" value={closedMessage} onChange={(e) => setClosedMessage(e.target.value)} placeholder="This form is no longer accepting responses." rows={2} maxLength={500} />
                            </div>
                        </div>

                        <Button onClick={handleSaveSettings} disabled={savingForm} className="gap-1.5">{savingForm ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : "Save All Settings"}</Button>

                        <Separator />

                        {/* Danger zone */}
                        <div className="rounded-lg border border-destructive/40 p-4">
                            <h2 className="text-base font-medium text-destructive">Danger Zone</h2>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium">Delete this form</p>
                                    <p className="text-sm text-muted-foreground">Permanently removes the form and all its responses. Cannot be undone.</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="mr-1 size-4" /> Delete Form</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete &ldquo;{form?.title}&rdquo;?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This permanently deletes the form and every response. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteForm}
                                                disabled={deletingForm}
                                                className="bg-destructive text-white hover:bg-destructive/90"
                                            >
                                                {deletingForm ? "Deleting…" : "Delete permanently"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </motion.div>
                    </TabsContent>

                    {/* SHARE TAB */}
                    <TabsContent value="share" className="mt-6 space-y-6">
                        <motion.div
                            key="share"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="space-y-6"
                        >
                        {isPublished ? (
                            <>
                                {/* Live response counter */}
                                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                                    <span className="relative flex size-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold">{analytics?.submissions ?? 0} response{(analytics?.submissions ?? 0) !== 1 ? "s" : ""}</p>
                                        <p className="text-xs text-muted-foreground">Live · updates every 5s</p>
                                    </div>
                                    <div className="ml-auto flex gap-4 text-xs text-muted-foreground">
                                        <span>{analytics?.views ?? 0} views</span>
                                        <span>{analytics?.completionRate ?? 0}% completion</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-base font-medium">Form Link</h2>
                                    <div className="flex gap-2">
                                        <Input readOnly value={shareUrl} className="font-mono text-sm" />
                                        <Button variant="outline" onClick={() => copy(shareUrl, "Link")}><Copy className="mr-1 size-4" /> Copy</Button>
                                    </div>
                                    {/* Social share */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {([
                                            ["X", socialLinks.x],
                                            ["LinkedIn", socialLinks.linkedin],
                                            ["WhatsApp", socialLinks.whatsapp],
                                            ["Email", socialLinks.email],
                                        ] as const).map(([label, href]) => (
                                            <Button key={label} asChild variant="outline" size="sm">
                                                <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
                                            </Button>
                                        ))}
                                        {typeof navigator !== "undefined" && "share" in navigator && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigator.share({ title: form?.title ?? "Form", url: shareUrl }).catch(() => {})}
                                            >
                                                Share…
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h2 className="text-base font-medium">Embed Code</h2>
                                    {/* Type switcher */}
                                    <div className="inline-flex rounded-lg border border-border/60 bg-muted/50 p-1">
                                        {([
                                            ["iframe", "Fixed iframe"],
                                            ["script", "Auto-resize"],
                                        ] as const).map(([val, lbl]) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setEmbedType(val)}
                                                className={cn(
                                                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                                                    embedType === val ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                                                )}
                                            >
                                                {lbl}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Size controls (iframe only) */}
                                    {embedType === "iframe" && (
                                        <div className="flex flex-wrap gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="embed-w" className="text-xs">Width</Label>
                                                <Input id="embed-w" value={embedWidth} onChange={(e) => setEmbedWidth(e.target.value)} className="h-8 w-28 font-mono text-xs" placeholder="100%" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="embed-h" className="text-xs">Height (px)</Label>
                                                <Input id="embed-h" value={embedHeight} onChange={(e) => setEmbedHeight(e.target.value.replace(/[^0-9]/g, ""))} className="h-8 w-28 font-mono text-xs" placeholder="600" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input readOnly value={embedCode} className="font-mono text-xs" />
                                        <Button variant="outline" onClick={() => copy(embedCode, "Embed")}><Copy className="mr-1 size-4" /> Copy</Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {embedType === "script"
                                            ? "Auto-resizes to fit the form height. Best for most sites."
                                            : "Fixed dimensions. Use when you need a set size."}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h2 className="text-base font-medium flex items-center gap-2"><QrCode className="size-5" /> QR Code</h2>
                                    <div className="flex items-start gap-6">
                                        <canvas ref={qrCallbackRef} className="rounded-lg border border-border" />
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">Scan to open the form on any device</p>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    Foreground
                                                    <input type="color" value={qrFg} onChange={(e) => setQrFg(e.target.value)} className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent" aria-label="QR foreground color" />
                                                </label>
                                                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    Background
                                                    <input type="color" value={qrBg} onChange={(e) => setQrBg(e.target.value)} className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent" aria-label="QR background color" />
                                                </label>
                                                {(qrFg !== "#000000" || qrBg !== "#ffffff") && (
                                                    <button type="button" onClick={() => { setQrFg("#000000"); setQrBg("#ffffff"); }} className="text-xs text-muted-foreground hover:text-foreground hover:underline">Reset</button>
                                                )}
                                            </div>
                                            <Button variant="outline" size="sm" onClick={downloadQr} disabled={!qrGenerated}><Download className="mr-1 size-4" /> Download PNG</Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
                                <Globe className="size-10 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Form not published</p>
                                    <p className="text-sm text-muted-foreground">Publish your form to get a shareable link, embed code, and QR code.</p>
                                </div>
                                <Button onClick={handlePublishToggle} disabled={savingForm}>Publish Now</Button>
                            </div>
                        )}
                    </motion.div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Field Dialog */}
            <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader><DialogTitle>{editingFieldId ? "Edit Field" : "Add Field"}</DialogTitle></DialogHeader>
                    <form className="space-y-5" onSubmit={handleSubmitField}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="f-label">Label</Label>
                                    {recallFields.length > 0 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button type="button" variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground">
                                                    <MagicWand className="size-3" /> Recall
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="max-h-64 w-56 overflow-y-auto">
                                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Insert a previous answer</DropdownMenuLabel>
                                                {recallFields.map((f) => (
                                                    <DropdownMenuItem key={f.id} onSelect={() => insertRecall(f.labelKey)}>
                                                        <span className="truncate">{f.label || "Untitled"}</span>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                <Input ref={fLabelRef} id="f-label" value={fLabel} onChange={(e) => setFLabel(e.target.value)} placeholder="e.g. Full Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="f-type">Type</Label>
                                <Select value={fType} onValueChange={(v) => setFType(v as FieldType)}>
                                    <SelectTrigger id="f-type"><SelectValue /></SelectTrigger>
                                    <SelectContent>{FIELD_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="f-description">Help text</Label>
                            <Textarea id="f-description" value={fDescription} onChange={(e) => setFDescription(e.target.value)} placeholder="Optional description shown under the question" rows={2} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="f-placeholder">Placeholder</Label>
                            <Input id="f-placeholder" value={fPlaceholder} onChange={(e) => setFPlaceholder(e.target.value)} placeholder="Optional hint text" />
                        </div>
                        {/* Validation rules (text + number types) */}
                        {["TEXT", "LONG_TEXT", "EMAIL", "PHONE", "WEBSITE", "PASSWORD", "NUMBER"].includes(fType) && (
                            <div className="space-y-2 rounded-lg border border-border p-3">
                                <Label className="text-xs text-muted-foreground">Validation (optional)</Label>
                                {fType === "NUMBER" ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input type="number" placeholder="Min value" value={fValidation.min ?? ""} onChange={(e) => setFValidation((p) => ({ ...p, min: e.target.value === "" ? undefined : Number(e.target.value) }))} />
                                        <Input type="number" placeholder="Max value" value={fValidation.max ?? ""} onChange={(e) => setFValidation((p) => ({ ...p, max: e.target.value === "" ? undefined : Number(e.target.value) }))} />
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input type="number" min="0" placeholder="Min length" value={fValidation.minLength ?? ""} onChange={(e) => setFValidation((p) => ({ ...p, minLength: e.target.value === "" ? undefined : Number(e.target.value) }))} />
                                            <Input type="number" min="1" placeholder="Max length" value={fValidation.maxLength ?? ""} onChange={(e) => setFValidation((p) => ({ ...p, maxLength: e.target.value === "" ? undefined : Number(e.target.value) }))} />
                                        </div>
                                        <Input placeholder="Regex pattern (e.g. ^[A-Z]{2}\\d{4}$)" value={fValidation.pattern ?? ""} onChange={(e) => setFValidation((p) => ({ ...p, pattern: e.target.value || undefined }))} className="font-mono text-xs" />
                                    </>
                                )}
                            </div>
                        )}
                        {isChoice && (
                            <div className="space-y-2">
                                <Label>Options</Label>
                                {fOptions.map((opt, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input value={opt} onChange={(e) => setFOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))} placeholder={`Option ${i + 1}`} />
                                        <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => setFOptions((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => setFOptions((prev) => [...prev, ""])}><Plus className="mr-1 size-3" /> Add Option</Button>
                            </div>
                        )}
                        {canJump && jumpAnswers.length > 0 && (
                            <div className="space-y-2">
                                <Label>Logic Jumps & Scoring</Label>
                                <div className="space-y-2 rounded-lg border border-border p-3">
                                    {jumpAnswers.map((ans) => (
                                        <div key={ans} className="flex items-center gap-2 text-sm">
                                            <span className="w-24 shrink-0 truncate font-medium">{ans}</span>
                                            <Select value={fLogic[ans] ?? "NEXT"} onValueChange={(v) => setFLogic((prev) => ({ ...prev, [ans]: v }))}>
                                                <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="NEXT">Next</SelectItem>
                                                    {(fields ?? []).filter((f) => f.id !== editingFieldId).map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                                                    <SelectItem value="END">Submit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input type="number" value={fScores[ans] ?? ""} onChange={(e) => setFScores((prev) => { const next = { ...prev }; if (e.target.value === "") delete next[ans]; else next[ans] = Number(e.target.value); return next; })} placeholder="pts" className="w-14 h-8 text-xs" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Switch id="f-required" checked={fRequired} onCheckedChange={setFRequired} />
                            <Label htmlFor="f-required">Required</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setFieldDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={addingField || updatingField || !fLabel.trim()} className="gap-1.5">{addingField || updatingField ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : editingFieldId ? "Update" : "Add Field"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Import Dialog */}
            <Dialog open={bulkImportOpen} onOpenChange={(open) => { if (!bulkProgress) setBulkImportOpen(open); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Import Questions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bulk-text">One question per line</Label>
                            <Textarea
                                id="bulk-text"
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                placeholder={"What is your name?\nHow did you hear about us?\nWould you recommend us?"}
                                rows={8}
                                disabled={!!bulkProgress}
                            />
                            <p className="text-xs text-muted-foreground">Each line becomes a TEXT field. You can change types after importing.</p>
                        </div>
                        {bulkProgress && (
                            <p className="text-sm text-muted-foreground animate-pulse">{bulkProgress}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setBulkImportOpen(false)} disabled={!!bulkProgress}>Cancel</Button>
                        <Button
                            type="button"
                            disabled={!bulkText.trim() || !!bulkProgress}
                            onClick={handleBulkImport}
                        >
                            {bulkProgress ? "Importing..." : `Import ${bulkText.split("\n").filter((l) => l.trim()).length || 0} Fields`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
