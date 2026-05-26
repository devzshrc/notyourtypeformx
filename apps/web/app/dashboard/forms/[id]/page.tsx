"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Pencil, Copy } from "lucide-react";
import {
    useGetForm,
    useUpdateForm,
    useListFields,
    useAddField,
    useUpdateField,
    useDeleteField,
    useReorderFields,
} from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";

const FIELD_TYPES = [
    "TEXT",
    "LONG_TEXT",
    "EMAIL",
    "NUMBER",
    "PHONE",
    "WEBSITE",
    "DATE",
    "YES_NO",
    "MULTIPLE_CHOICE",
    "CHECKBOXES",
    "DROPDOWN",
    "RATING",
    "PASSWORD",
    "STATEMENT",
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

    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [titleEditing, setTitleEditing] = useState(false);

    const [welcomeTitle, setWelcomeTitle] = useState("");
    const [welcomeDescription, setWelcomeDescription] = useState("");
    const [endingTitle, setEndingTitle] = useState("");
    const [endingDescription, setEndingDescription] = useState("");

    const [origin, setOrigin] = useState("");
    useEffect(() => setOrigin(window.location.origin), []);

    useEffect(() => {
        if (form) {
            setWelcomeTitle(form.welcomeTitle ?? "");
            setWelcomeDescription(form.welcomeDescription ?? "");
            setEndingTitle(form.endingTitle ?? "");
            setEndingDescription(form.endingDescription ?? "");
        }
    }, [form]);

    const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [fLabel, setFLabel] = useState("");
    const [fType, setFType] = useState<FieldType>("TEXT");
    const [fPlaceholder, setFPlaceholder] = useState("");
    const [fRequired, setFRequired] = useState(false);
    const [fOptions, setFOptions] = useState<string[]>([]);
    const [fLogic, setFLogic] = useState<Record<string, string>>({});
    const [fScores, setFScores] = useState<Record<string, number>>({});

    const [hiddenFields, setHiddenFields] = useState<string[]>([]);
    useEffect(() => {
        if (form) setHiddenFields(form.hiddenFields ?? []);
    }, [form]);

    const openAddDialog = () => {
        setEditingFieldId(null);
        setFLabel("");
        setFType("TEXT");
        setFPlaceholder("");
        setFRequired(false);
        setFOptions([]);
        setFLogic({});
        setFScores({});
        setFieldDialogOpen(true);
    };

    const openEditDialog = (field: NonNullable<typeof fields>[number]) => {
        setEditingFieldId(field.id);
        setFLabel(field.label);
        setFType(field.type);
        setFPlaceholder(field.placeholder ?? "");
        setFRequired(field.isRequired);
        setFOptions(field.options ?? []);
        const map: Record<string, string> = {};
        (field.logic ?? []).forEach((r) => (map[r.equals] = r.goTo));
        setFLogic(map);
        setFScores(field.scores ?? {});
        setFieldDialogOpen(true);
    };

    const handleUpdateTitle = async () => {
        if (!editTitle.trim()) return;
        await updateFormAsync({ formId, title: editTitle.trim(), description: editDescription.trim() || undefined });
        setTitleEditing(false);
    };

    const handleSaveScreens = async () => {
        await updateFormAsync({
            formId,
            welcomeTitle: welcomeTitle.trim(),
            welcomeDescription: welcomeDescription.trim(),
            endingTitle: endingTitle.trim(),
            endingDescription: endingDescription.trim(),
        });
        toast.success("Screens saved");
    };

    const isPublished = form?.status === "PUBLISHED";

    const handlePublishToggle = async () => {
        await updateFormAsync({ formId, status: isPublished ? "DRAFT" : "PUBLISHED" });
        if (isPublished) {
            toast.success("Form unpublished");
        } else {
            const url = `${window.location.origin}/form/${form?.slug ?? formId}`;
            toast.success("Form published", {
                description: url,
                action: { label: "Copy link", onClick: () => void navigator.clipboard.writeText(url) },
            });
        }
    };

    const shareUrl = origin ? `${origin}/form/${form?.slug ?? formId}` : "";
    const embedCode = shareUrl
        ? `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`
        : "";

    const copy = async (text: string, label: string) => {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
    };

    const isChoice = CHOICE_TYPES.includes(fType);
    const canJump = isChoice || fType === "YES_NO";
    const jumpAnswers = fType === "YES_NO" ? ["yes", "no"] : fOptions.map((o) => o.trim()).filter(Boolean);

    const handleSaveHidden = async () => {
        await updateFormAsync({ formId, hiddenFields: hiddenFields.map((h) => h.trim()).filter(Boolean) });
        toast.success("Hidden fields saved");
    };

    const handleSubmitField = async (e: FormEvent) => {
        e.preventDefault();
        const cleanOptions = fOptions.map((o) => o.trim()).filter(Boolean);
        const options = isChoice ? cleanOptions : [];
        const logic = canJump
            ? Object.entries(fLogic)
                  .filter(([equals, goTo]) => goTo && goTo !== "NEXT" && jumpAnswers.includes(equals))
                  .map(([equals, goTo]) => ({ equals, goTo }))
            : [];
        const scores: Record<string, number> = {};
        if (canJump) {
            for (const ans of jumpAnswers) {
                const n = fScores[ans];
                if (typeof n === "number" && !Number.isNaN(n)) scores[ans] = n;
            }
        }
        if (editingFieldId) {
            await updateFieldAsync({
                fieldId: editingFieldId,
                formId,
                label: fLabel.trim(),
                type: fType,
                placeholder: fPlaceholder.trim() || undefined,
                isRequired: fRequired,
                options,
                logic,
                scores,
            });
        } else {
            await addFieldAsync({
                formId,
                label: fLabel.trim(),
                type: fType,
                placeholder: fPlaceholder.trim() || undefined,
                isRequired: fRequired,
                index: fields?.length ?? 0,
                options,
                logic,
                scores,
            });
        }
        setFieldDialogOpen(false);
    };

    const handleDeleteField = async (fieldId: string) => {
        await deleteFieldAsync({ fieldId, formId });
    };

    const moveField = async (idx: number, dir: -1 | 1) => {
        if (!fields) return;
        const target = idx + dir;
        if (target < 0 || target >= fields.length) return;
        const ids = fields.map((f) => f.id);
        [ids[idx], ids[target]] = [ids[target]!, ids[idx]!];
        await reorderFieldsAsync({ formId, fieldIds: ids });
    };

    if (formLoading) {
        return (
            <main className="min-h-screen bg-background px-6 py-6 text-foreground">
                <p className="text-muted-foreground">Loading...</p>
            </main>
        );
    }

    const savingField = addingField || updatingField;

    return (
        <main className="min-h-screen bg-background px-6 py-6 text-foreground">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        {titleEditing ? (
                            <div className="flex gap-2">
                                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                <Button onClick={handleUpdateTitle}>Save</Button>
                                <Button variant="ghost" onClick={() => setTitleEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1
                                    className="cursor-pointer text-2xl font-semibold tracking-tight hover:text-foreground/80"
                                    onClick={() => {
                                        setEditTitle(form?.title ?? "");
                                        setEditDescription(form?.description ?? "");
                                        setTitleEditing(true);
                                    }}
                                >
                                    {form?.title}
                                </h1>
                                <Badge variant={isPublished ? "default" : "secondary"}>
                                    {isPublished ? "Published" : "Draft"}
                                </Badge>
                            </div>
                        )}
                        {!titleEditing && form?.description && (
                            <p className="text-sm text-muted-foreground">{form.description}</p>
                        )}
                    </div>
                    <Link href={`/form/${formId}`} target="_blank">
                        <Button variant="outline">Preview</Button>
                    </Link>
                    <Button onClick={handlePublishToggle} disabled={savingForm}>
                        {isPublished ? "Unpublish" : "Publish"}
                    </Button>
                </div>

                {/* Share */}
                <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
                    <h2 className="text-sm font-medium text-muted-foreground">Share</h2>
                    {isPublished ? (
                        <>
                            <div className="flex gap-2">
                                <Input readOnly value={shareUrl} />
                                <Button variant="outline" size="icon" onClick={() => copy(shareUrl, "Link")}>
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Input readOnly value={embedCode} className="font-mono text-xs" />
                                <Button variant="outline" size="icon" onClick={() => copy(embedCode, "Embed code")}>
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Publish this form to get a shareable link and embed code.
                        </p>
                    )}
                </section>

                {/* Fields */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">Fields</h2>
                        <Button size="sm" onClick={openAddDialog}>
                            <Plus className="mr-1 size-3" /> Add Field
                        </Button>
                    </div>

                    {fieldsLoading ? (
                        <p className="text-sm text-muted-foreground">Loading fields...</p>
                    ) : fields && fields.length > 0 ? (
                        fields.map((field, idx) => (
                            <div
                                key={field.id}
                                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                            >
                                <div className="flex flex-col">
                                    <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => moveField(idx, -1)}
                                        className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                                    >
                                        <ChevronUp className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={idx === fields.length - 1}
                                        onClick={() => moveField(idx, 1)}
                                        className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                                    >
                                        <ChevronDown className="size-4" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{field.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {field.type} {field.isRequired && "• Required"}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(field)}>
                                    <Pencil className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteField(field.id)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                            No fields yet. Add one to get started.
                        </p>
                    )}
                </section>

                {/* Welcome / Ending screens */}
                <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
                    <h2 className="text-sm font-medium text-muted-foreground">Welcome &amp; Ending Screens</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Welcome title</label>
                            <Input
                                value={welcomeTitle}
                                onChange={(e) => setWelcomeTitle(e.target.value)}
                                placeholder="Optional"
                            />
                            <Textarea
                                value={welcomeDescription}
                                onChange={(e) => setWelcomeDescription(e.target.value)}
                                placeholder="Welcome description"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Ending title</label>
                            <Input
                                value={endingTitle}
                                onChange={(e) => setEndingTitle(e.target.value)}
                                placeholder="Optional"
                            />
                            <Textarea
                                value={endingDescription}
                                onChange={(e) => setEndingDescription(e.target.value)}
                                placeholder="Ending description"
                            />
                        </div>
                    </div>
                    <div>
                        <Button onClick={handleSaveScreens} disabled={savingForm}>
                            {savingForm ? "Saving..." : "Save Screens"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Tip: recall a previous answer in any question with{" "}
                        <code className="rounded bg-muted px-1">{"{{field_key}}"}</code> (the field&apos;s label key).
                    </p>
                </section>

                {/* Hidden fields */}
                <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
                    <h2 className="text-sm font-medium text-muted-foreground">Hidden Fields</h2>
                    <p className="text-xs text-muted-foreground">
                        Captured from URL query params (e.g. <code className="rounded bg-muted px-1">?utm_source=x</code>)
                        and stored with each response.
                    </p>
                    {hiddenFields.map((h, i) => (
                        <div key={i} className="flex gap-2">
                            <Input
                                value={h}
                                onChange={(e) =>
                                    setHiddenFields((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                                }
                                placeholder="e.g. utm_source"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setHiddenFields((prev) => prev.filter((_, j) => j !== i))}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setHiddenFields((p) => [...p, ""])}>
                            <Plus className="mr-1 size-3" /> Add Key
                        </Button>
                        <Button size="sm" onClick={handleSaveHidden} disabled={savingForm}>
                            Save
                        </Button>
                    </div>
                </section>
            </div>

            {/* Add/Edit field dialog */}
            <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingFieldId ? "Edit Field" : "Add Field"}</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSubmitField}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Label</label>
                            <Input value={fLabel} onChange={(e) => setFLabel(e.target.value)} placeholder="e.g. Full Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select value={fType} onValueChange={(v) => setFType(v as FieldType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FIELD_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {isChoice && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Options</label>
                                {fOptions.map((opt, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input
                                            value={opt}
                                            onChange={(e) =>
                                                setFOptions((prev) =>
                                                    prev.map((o, j) => (j === i ? e.target.value : o)),
                                                )
                                            }
                                            placeholder={`Option ${i + 1}`}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => setFOptions((prev) => prev.filter((_, j) => j !== i))}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFOptions((prev) => [...prev, ""])}
                                >
                                    <Plus className="mr-1 size-3" /> Add Option
                                </Button>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Placeholder</label>
                            <Input value={fPlaceholder} onChange={(e) => setFPlaceholder(e.target.value)} placeholder="Optional" />
                        </div>
                        {canJump && jumpAnswers.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Logic jumps</label>
                                <p className="text-xs text-muted-foreground">
                                    Per answer: jump target + score (for quizzes / lead scoring).
                                </p>
                                {jumpAnswers.map((ans) => (
                                    <div key={ans} className="flex items-center gap-2">
                                        <span className="w-20 shrink-0 truncate text-sm">{ans}</span>
                                        <span className="text-xs text-muted-foreground">→</span>
                                        <Select
                                            value={fLogic[ans] ?? "NEXT"}
                                            onValueChange={(v) => setFLogic((prev) => ({ ...prev, [ans]: v }))}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NEXT">Next question</SelectItem>
                                                {(fields ?? [])
                                                    .filter((f) => f.id !== editingFieldId)
                                                    .map((f) => (
                                                        <SelectItem key={f.id} value={f.id}>
                                                            {f.label}
                                                        </SelectItem>
                                                    ))}
                                                <SelectItem value="END">End / Submit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            value={fScores[ans] ?? ""}
                                            onChange={(e) =>
                                                setFScores((prev) => {
                                                    const next = { ...prev };
                                                    if (e.target.value === "") delete next[ans];
                                                    else next[ans] = Number(e.target.value);
                                                    return next;
                                                })
                                            }
                                            placeholder="pts"
                                            className="w-16 shrink-0"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={fRequired}
                                onChange={(e) => setFRequired(e.target.checked)}
                            />
                            Required
                        </label>
                        <DialogFooter>
                            <Button type="submit" disabled={savingField || !fLabel.trim()}>
                                {savingField ? "Saving..." : editingFieldId ? "Save" : "Add"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </main>
    );
}
