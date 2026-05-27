"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useGetPublicForm } from "~/hooks/api/form";

export default function EmbedFormPage() {
    const { id } = useParams<{ id: string }>();
    const { form, isLoading, error } = useGetPublicForm(id);
    const containerRef = useRef<HTMLDivElement>(null);

    // Post height to parent for auto-resize
    useEffect(() => {
        const sendHeight = () => {
            if (containerRef.current) {
                window.parent.postMessage({ type: "schema-form-resize", height: containerRef.current.scrollHeight }, "*");
            }
        };
        sendHeight();
        const observer = new ResizeObserver(sendHeight);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [form]);

    if (isLoading) return <div style={{ padding: 24, textAlign: "center", color: "#888" }}>Loading...</div>;
    if (error || !form) return <div style={{ padding: 24, textAlign: "center", color: "#888" }}>Form not found</div>;

    // Redirect to the full form page in an embedded context
    // The form/[id] page already handles rendering — we just iframe it
    return (
        <div ref={containerRef} style={{ width: "100%", minHeight: "100vh" }}>
            <iframe
                src={`/form/${id}?embed=1`}
                style={{ width: "100%", height: "100vh", border: "none" }}
                title={form.title ?? "Form"}
            />
        </div>
    );
}
