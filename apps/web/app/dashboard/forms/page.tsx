// apps/web/app/dashboard/forms/page.tsx

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, PencilLine } from "lucide-react";

import { useCreateForm, useListForms } from "~/hooks/api/form";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ThemeToggle } from "~/components/theme-toggle";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export default function DashboardForms() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const { createFormAsync, error, status } = useCreateForm();
    const { forms, isLoading } = useListForms();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await createFormAsync({
            title: title.trim(),
            description: description.trim() ? description.trim() : undefined,
        });

        setOpen(false);
        setTitle("");
        setDescription("");
    };

    return (
        <main className="min-h-screen bg-background px-6 py-6 text-foreground">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Forms</p>
                        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>Create Form</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create Form</DialogTitle>
                                    <DialogDescription>
                                        Add a title and optional description.
                                    </DialogDescription>
                                </DialogHeader>

                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <label htmlFor="title" className="text-sm font-medium">
                                            Title
                                        </label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(event) => setTitle(event.target.value)}
                                            placeholder="Form title"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="description" className="text-sm font-medium">
                                            Description
                                        </label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                            placeholder="Optional description"
                                            className="min-h-24"
                                        />
                                    </div>

                                    {error ? (
                                        <p className="text-sm text-destructive">{error.message}</p>
                                    ) : null}

                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            disabled={status === "pending" || title.trim().length === 0}
                                        >
                                            {status === "pending" ? "Creating..." : "Create"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <section className="grid gap-3">
                    {isLoading ? (
                        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                            Loading forms...
                        </div>
                    ) : forms && forms.length > 0 ? (
                        forms.map((form) => (
                            <article
                                key={form.id}
                                className="rounded-lg border border-border bg-card p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-medium">{form.title}</h2>
                                            <Badge variant={form.status === "PUBLISHED" ? "default" : "secondary"}>
                                                {form.status === "PUBLISHED" ? "Published" : "Draft"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {form.description || "No description"}
                                        </p>
                                        <span className="block text-xs text-muted-foreground">
                                            {form.createdAt
                                                ? new Date(form.createdAt).toLocaleDateString()
                                                : ""}
                                        </span>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <Button asChild variant="outline" size="icon">
                                            <Link
                                                href={`/form/${form.id}/submissions`}
                                                aria-label="View submissions"
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                        </Button>

                                        <Button asChild variant="outline" size="icon">
                                            <Link
                                                href={`/dashboard/forms/${form.id}`}
                                                aria-label="Edit form"
                                            >
                                                <PencilLine className="size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                            No forms yet.
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
