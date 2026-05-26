"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { useGetForm, useUpdateForm, useListFields, useAddField, useDeleteField } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";

const FIELD_TYPES = ["TEXT", "EMAIL", "NUMBER", "YES_NO", "PASSWORD"] as const;

export default function FormEditorPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const formId = params.id;

    const { form, isLoading: formLoading } = useGetForm(formId);
    const { updateFormAsync } = useUpdateForm();
    const { fields, isLoading: fieldsLoading } = useListFields(formId);
    const { addFieldAsync, isPending: addingField } = useAddField();
    const { deleteFieldAsync } = useDeleteField();

    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [titleEditing, setTitleEditing] = useState(false);

    // Add field dialog state
    const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newType, setNewType] = useState<(typeof FIELD_TYPES)[number]>("TEXT");
    const [newPlaceholder, setNewPlaceholder] = useState("");
    const [newRequired, setNewRequired] = useState(false);

    const handleUpdateTitle = async () => {
        if (!editTitle.trim()) return;
        await updateFormAsync({ formId, title: editTitle.trim(), description: editDescription.trim() || undefined });
        setTitleEditing(false);
    };

    const handleAddField = async (e: FormEvent) => {
        e.preventDefault();
        await addFieldAsync({
            formId,
            label: newLabel.trim(),
            type: newType,
            placeholder: newPlaceholder.trim() || undefined,
            isRequired: newRequired,
            index: fields?.length ?? 0,
        });
        setFieldDialogOpen(false);
        setNewLabel("");
        setNewType("TEXT");
        setNewPlaceholder("");
        setNewRequired(false);
    };

    const handleDeleteField = async (fieldId: string) => {
        await deleteFieldAsync({ fieldId, formId });
    };

    if (formLoading) {
        return (
            <main className="min-h-screen bg-black px-6 py-6 text-white">
                <p className="text-white/50">Loading...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black px-6 py-6 text-white">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms">
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        {titleEditing ? (
                            <div className="flex gap-2">
                                <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white"
                                />
                                <Button onClick={handleUpdateTitle} className="bg-white text-black hover:bg-white/90">
                                    Save
                                </Button>
                                <Button variant="ghost" onClick={() => setTitleEditing(false)} className="text-white/60">
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <h1
                                className="cursor-pointer text-2xl font-semibold tracking-tight hover:text-white/80"
                                onClick={() => {
                                    setEditTitle(form?.title ?? "");
                                    setEditDescription(form?.description ?? "");
                                    setTitleEditing(true);
                                }}
                            >
                                {form?.title}
                            </h1>
                        )}
                        {!titleEditing && form?.description && (
                            <p className="text-sm text-white/50">{form.description}</p>
                        )}
                    </div>
                    <Link href={`/form/${formId}`} target="_blank">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                            Preview
                        </Button>
                    </Link>
                </div>

                {/* Fields */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-white/70">Fields</h2>
                        <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="bg-white text-black hover:bg-white/90">
                                    <Plus className="mr-1 size-3" /> Add Field
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Field</DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleAddField}>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/70">Label</label>
                                        <Input
                                            value={newLabel}
                                            onChange={(e) => setNewLabel(e.target.value)}
                                            placeholder="e.g. Full Name"
                                            className="border-white/10 bg-white/5 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/70">Type</label>
                                        <Select value={newType} onValueChange={(v) => setNewType(v as typeof newType)}>
                                            <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FIELD_TYPES.map((t) => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/70">Placeholder</label>
                                        <Input
                                            value={newPlaceholder}
                                            onChange={(e) => setNewPlaceholder(e.target.value)}
                                            placeholder="Optional"
                                            className="border-white/10 bg-white/5 text-white"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-white/70">
                                        <input
                                            type="checkbox"
                                            checked={newRequired}
                                            onChange={(e) => setNewRequired(e.target.checked)}
                                        />
                                        Required
                                    </label>
                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            disabled={addingField || !newLabel.trim()}
                                            className="bg-white text-black hover:bg-white/90"
                                        >
                                            {addingField ? "Adding..." : "Add"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {fieldsLoading ? (
                        <p className="text-sm text-white/50">Loading fields...</p>
                    ) : fields && fields.length > 0 ? (
                        fields.map((field) => (
                            <div
                                key={field.id}
                                className="flex items-center gap-3 border border-white/10 bg-white/5 p-4"
                            >
                                <GripVertical className="size-4 text-white/30" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">{field.label}</p>
                                    <p className="text-xs text-white/50">
                                        {field.type} {field.isRequired && "• Required"}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-400 hover:text-red-300"
                                    onClick={() => handleDeleteField(field.id)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="border border-white/10 bg-white/5 p-6 text-sm text-white/50">
                            No fields yet. Add one to get started.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}
