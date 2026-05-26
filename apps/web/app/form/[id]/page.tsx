"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useGetPublicForm, useSubmitForm } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function PublicFormPage() {
    const params = useParams<{ id: string }>();
    const formId = params.id;

    const { form, isLoading, error: fetchError } = useGetPublicForm(formId);
    const { submitFormAsync, isPending, isSuccess, error: submitError } = useSubmitForm();

    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleChange = (labelKey: string, value: string) => {
        setFormData((prev) => ({ ...prev, [labelKey]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await submitFormAsync({ formId, data: formData });
    };

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <p className="text-white/50">Loading form...</p>
            </main>
        );
    }

    if (fetchError || !form) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <p className="text-red-400">Form not found.</p>
            </main>
        );
    }

    if (isSuccess) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Thank you!</h1>
                    <p className="mt-2 text-white/60">Your response has been submitted.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black px-6 py-12 text-white">
            <div className="mx-auto w-full max-w-lg">
                <h1 className="text-2xl font-semibold tracking-tight">{form.title}</h1>
                {form.description && <p className="mt-1 text-sm text-white/60">{form.description}</p>}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {form.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-sm text-white/80">
                                {field.label}
                                {field.isRequired && <span className="ml-1 text-red-400">*</span>}
                            </label>
                            {field.description && (
                                <p className="text-xs text-white/40">{field.description}</p>
                            )}
                            {field.type === "YES_NO" ? (
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-white/70">
                                        <input
                                            type="radio"
                                            name={field.labelKey}
                                            value="yes"
                                            onChange={() => handleChange(field.labelKey, "yes")}
                                        />
                                        Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-white/70">
                                        <input
                                            type="radio"
                                            name={field.labelKey}
                                            value="no"
                                            onChange={() => handleChange(field.labelKey, "no")}
                                        />
                                        No
                                    </label>
                                </div>
                            ) : (
                                <Input
                                    type={field.type === "EMAIL" ? "email" : field.type === "NUMBER" ? "number" : field.type === "PASSWORD" ? "password" : "text"}
                                    placeholder={field.placeholder ?? ""}
                                    required={field.isRequired}
                                    value={formData[field.labelKey] ?? ""}
                                    onChange={(e) => handleChange(field.labelKey, e.target.value)}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                                />
                            )}
                        </div>
                    ))}

                    {submitError && <p className="text-sm text-red-400">{submitError.message}</p>}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-white text-black hover:bg-white/90"
                    >
                        {isPending ? "Submitting..." : "Submit"}
                    </Button>
                </form>
            </div>
        </main>
    );
}
