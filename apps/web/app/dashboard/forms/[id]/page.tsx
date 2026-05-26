"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Pencil, Copy,
    QrCode, Download, Lock, Clock, Hash, Eye, Globe, EyeOff,
} from "lucide-react";
import QRCode from "qrcode";
import {
    useGetForm, useUpdateForm, useListFields,
    useAddField, useUpdateField, useDeleteField, useReorderFields,
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
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";

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
    const [formPassword, setFormPassword] = useState("");
    const [hiddenFields, setHiddenFields] = useState<string[]>([]);

    // QR
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const [qrGenerated, setQrGenerated] = useState(false);

    // Field dialog
    const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [fLabel, setFLabel] = useState("");
    const [fType, setFType] = useState<FieldType>("TEXT");
    const [fPlaceholder, setFPlaceholder] = useState("");
    const [fRequired, setFRequired] = useState(false);
    const [fOptions, setFOptions] = useState<string[]>([]);
    const [fLogic, setFLogic] = useState<Record<string, string>>({});
    const [fScores, setFScores] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!form) return;
        setWelcomeTitle(form.welcomeTitle ?? "");
        setWelcomeDescription(form.welcomeDescription ?? "");
        setEndingTitle(form.endingTitle ?? "");
        setEndingDescription(form.endingDescription ?? "");
        setExpiresAt(form.expiresAt ? new Date(form.expiresAt).toISOString().slice(0, 16) : "");
        setMaxResponses(form.maxResponses ? String(form.maxResponses) : "");
        setFormPassword(form.password ?? "");
        setHiddenFields(form.hiddenFields ?? []);
    }, [form]);

    useEffect(() => {
        if (form?.status === "PUBLISHED" && qrCanvasRef.current) {
            const url = `${window.location.origin}/form/${form.slug ?? formId}`;
            QRCode.toCanvas(qrCanvasRef.current, url, { width: 160, margin: 2 }, () => setQrGenerated(true));
        }
    }, [form?.status, form?.slug, formId]);

    // Handlers
    const isPublished = form?.status === "PUBLISHED";
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/form/${form?.slug ?? formId}` : "";
    const embedCode = shareUrl ? `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>` : "";

    const copy = async (text: string, label: string) => { await navigator.clipboard.writeText(text); toast.success(`${label} copied`); };
    const downloadQr = () => { if (!qrCanvasRef.current) return; const a = document.createElement("a"); a.href = qrCanvasRef.current.toDataURL("image/png"); a.download = `${form?.title ?? "form"}-qr.png`; a.click(); };

    const handleUpdateTitle = async () => { if (!editTitle.trim()) return; await updateFormAsync({ formId, title: editTitle.trim(), description: editDescription.trim() || undefined }); setTitleEditing(false); };
    const handlePublishToggle = async () => {
        await updateFormAsync({ formId, status: isPublished ? "DRAFT" : "PUBLISHED" });
        toast.success(isPublished ? "Form unpublished" : "Form published!");
    };
    const handleSaveScreens = async () => { await updateFormAsync({ formId, welcomeTitle: welcomeTitle.trim(), welcomeDescription: welcomeDescription.trim(), endingTitle: endingTitle.trim(), endingDescription: endingDescription.trim() }); toast.success("Screens saved"); };
    const handleSaveSettings = async () => { await updateFormAsync({ formId, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null, maxResponses: maxResponses ? parseInt(maxResponses) : null, password: formPassword.trim() || null, hiddenFields: hiddenFields.map((h) => h.trim()).filter(Boolean) }); toast.success("Settings saved"); };

    const openAddDialog = () => { setEditingFieldId(null); setFLabel(""); setFType("TEXT"); setFPlaceholder(""); setFRequired(false); setFOptions([]); setFLogic({}); setFScores({}); setFieldDialogOpen(true); };
    const openEditDialog = (field: NonNullable<typeof fields>[number]) => { setEditingFieldId(field.id); setFLabel(field.label); setFType(field.type); setFPlaceholder(field.placeholder ?? ""); setFRequired(field.isRequired); setFOptions(field.options ?? []); const map: Record<string, string> = {}; (field.logic ?? []).forEach((r) => (map[r.equals] = r.goTo)); setFLogic(map); setFScores(field.scores ?? {}); setFieldDialogOpen(true); };

    const handleSubmitField = async (e: FormEvent) => {
        e.preventDefault();
        const options = CHOICE_TYPES.includes(fType) ? fOptions.map((o) => o.trim()).filter(Boolean) : [];
        const canJump = CHOICE_TYPES.includes(fType) || fType === "YES_NO";
        const jumpAnswers = fType === "YES_NO" ? ["yes", "no"] : options;
        const logic = canJump ? Object.entries(fLogic).filter(([eq, goTo]) => goTo && goTo !== "NEXT" && jumpAnswers.includes(eq)).map(([equals, goTo]) => ({ equals, goTo })) : [];
        const scores: Record<string, number> = {};
        if (canJump) { for (const ans of jumpAnswers) { const n = fScores[ans]; if (typeof n === "number" && !Number.isNaN(n)) scores[ans] = n; } }
        if (editingFieldId) { await updateFieldAsync({ fieldId: editingFieldId, formId, label: fLabel.trim(), type: fType, placeholder: fPlaceholder.trim() || undefined, isRequired: fRequired, options, logic, scores }); }
        else { await addFieldAsync({ formId, label: fLabel.trim(), type: fType, placeholder: fPlaceholder.trim() || undefined, isRequired: fRequired, index: fields?.length ?? 0, options, logic, scores }); }
        setFieldDialogOpen(false);
    };

    const moveField = async (idx: number, dir: -1 | 1) => { if (!fields) return; const target = idx + dir; if (target < 0 || target >= fields.length) return; const ids = fields.map((f) => f.id); [ids[idx], ids[target]] = [ids[target]!, ids[idx]!]; await reorderFieldsAsync({ formId, fieldIds: ids }); };

    if (formLoading) return <div className="px-6 py-8"><div className="mx-auto max-w-4xl space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div></div>;

    const isChoice = CHOICE_TYPES.includes(fType);
    const canJump = isChoice || fType === "YES_NO";
    const jumpAnswers = fType === "YES_NO" ? ["yes", "no"] : fOptions.map((o) => o.trim()).filter(Boolean);

    return (
        <div className="px-6 py-8">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms"><Button variant="ghost" size="icon" aria-label="Back"><ArrowLeft className="size-4" /></Button></Link>
                    <div className="flex-1 min-w-0">
                        {titleEditing ? (
                            <div className="flex gap-2">
                                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="max-w-xs" />
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
                    <div className="flex items-center gap-2">
                        <Link href={`/form/${form?.slug ?? formId}`} target="_blank"><Button variant="outline" size="sm"><Eye className="mr-1 size-4" /> Preview</Button></Link>
                        <Button size="sm" onClick={handlePublishToggle} disabled={savingForm} variant={isPublished ? "secondary" : "default"}>
                            {isPublished ? "Unpublish" : "Publish"}
                        </Button>
                    </div>
                </div>

                {/* Tabbed content */}
                <Tabs defaultValue="build" className="w-full">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="build">Build</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="share">Share</TabsTrigger>
                    </TabsList>

                    {/* BUILD TAB */}
                    <TabsContent value="build" className="mt-6 space-y-6">
                        {/* Fields */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-medium">Questions</h2>
                                <p className="text-sm text-muted-foreground">{fields?.length ?? 0} field{(fields?.length ?? 0) !== 1 ? "s" : ""}</p>
                            </div>
                            <Button onClick={openAddDialog}><Plus className="mr-1 size-4" /> Add Field</Button>
                        </div>

                        {fieldsLoading ? (
                            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                        ) : fields && fields.length > 0 ? (
                            <div className="space-y-2">
                                {fields.map((field, idx) => (
                                    <div key={field.id} className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
                                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" disabled={idx === 0} onClick={() => moveField(idx, -1)} aria-label="Move up" className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronUp className="size-4" /></button>
                                            <button type="button" disabled={idx === fields.length - 1} onClick={() => moveField(idx, 1)} aria-label="Move down" className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronDown className="size-4" /></button>
                                        </div>
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-medium">{field.label}</p>
                                            <p className="text-xs text-muted-foreground">{field.type.replace(/_/g, " ").toLowerCase()}{field.isRequired && " · required"}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditDialog(field)}><Pencil className="size-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => deleteFieldAsync({ fieldId: field.id, formId })}><Trash2 className="size-3.5" /></Button>
                                        </div>
                                    </div>
                                ))}
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
                            <Button className="mt-4" size="sm" onClick={handleSaveScreens} disabled={savingForm}>{savingForm ? "Saving..." : "Save Screens"}</Button>
                        </div>
                    </TabsContent>

                    {/* SETTINGS TAB */}
                    <TabsContent value="settings" className="mt-6 space-y-8">
                        <div>
                            <h2 className="text-base font-medium">Access Control</h2>
                            <p className="text-sm text-muted-foreground mb-4">Control who can access and submit this form</p>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="set-password" className="flex items-center gap-2"><Lock className="size-4" /> Password Protection</Label>
                                    <Input id="set-password" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Leave empty for no password" />
                                    <p className="text-xs text-muted-foreground">Respondents must enter this password before filling the form</p>
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

                        <Button onClick={handleSaveSettings} disabled={savingForm}>{savingForm ? "Saving..." : "Save All Settings"}</Button>
                    </TabsContent>

                    {/* SHARE TAB */}
                    <TabsContent value="share" className="mt-6 space-y-6">
                        {isPublished ? (
                            <>
                                <div className="space-y-3">
                                    <h2 className="text-base font-medium">Form Link</h2>
                                    <div className="flex gap-2">
                                        <Input readOnly value={shareUrl} className="font-mono text-sm" />
                                        <Button variant="outline" onClick={() => copy(shareUrl, "Link")}><Copy className="mr-1 size-4" /> Copy</Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h2 className="text-base font-medium">Embed Code</h2>
                                    <div className="flex gap-2">
                                        <Input readOnly value={embedCode} className="font-mono text-xs" />
                                        <Button variant="outline" onClick={() => copy(embedCode, "Embed")}><Copy className="mr-1 size-4" /> Copy</Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h2 className="text-base font-medium flex items-center gap-2"><QrCode className="size-5" /> QR Code</h2>
                                    <div className="flex items-start gap-6">
                                        <canvas ref={qrCanvasRef} className="rounded-lg border border-border" />
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Scan to open the form on any device</p>
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
                                <Label htmlFor="f-label">Label</Label>
                                <Input id="f-label" value={fLabel} onChange={(e) => setFLabel(e.target.value)} placeholder="e.g. Full Name" />
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
                            <Label htmlFor="f-placeholder">Placeholder</Label>
                            <Input id="f-placeholder" value={fPlaceholder} onChange={(e) => setFPlaceholder(e.target.value)} placeholder="Optional hint text" />
                        </div>
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
                            <Button type="submit" disabled={addingField || updatingField || !fLabel.trim()}>{addingField || updatingField ? "Saving..." : editingFieldId ? "Update" : "Add Field"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
