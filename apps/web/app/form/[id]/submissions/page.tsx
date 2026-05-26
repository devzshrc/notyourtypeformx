"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useListSubmissions, useGetForm } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";

export default function SubmissionsPage() {
    const params = useParams<{ id: string }>();
    const formId = params.id;

    const { form } = useGetForm(formId);
    const { submissions, isLoading, error } = useListSubmissions(formId);

    return (
        <main className="min-h-screen bg-black px-6 py-6 text-white">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/forms">
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <p className="text-sm text-white/60">Submissions</p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {form?.title ?? "Loading..."}
                        </h1>
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-sm text-white/50">Loading submissions...</p>
                ) : error ? (
                    <p className="text-sm text-red-400">{error.message}</p>
                ) : submissions && submissions.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {submissions.map((sub) => (
                            <article
                                key={sub.id}
                                className="border border-white/10 bg-white/5 p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <pre className="flex-1 overflow-x-auto text-xs text-white/80">
                                        {JSON.stringify(sub.data, null, 2)}
                                    </pre>
                                    <span className="shrink-0 text-xs text-white/40">
                                        {sub.createdAt
                                            ? new Date(sub.createdAt).toLocaleString()
                                            : ""}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="border border-white/10 bg-white/5 p-6 text-sm text-white/50">
                        No submissions yet.
                    </p>
                )}
            </div>
        </main>
    );
}
