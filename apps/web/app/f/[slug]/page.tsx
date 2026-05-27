"use client";

import { useParams, redirect } from "next/navigation";
import { trpc } from "~/trpc/client";

export default function SlugFormPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data: form, isLoading, error } = trpc.form.getFormBySlug.useQuery({ slug }, { enabled: !!slug });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-muted-foreground">Loading form...</p>
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Form not found</h1>
                    <p className="text-muted-foreground">This form may have been removed or the link is incorrect.</p>
                </div>
            </div>
        );
    }

    // Redirect to the actual form page with the form ID
    redirect(`/form/${form.id}`);
}
