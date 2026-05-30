import { ImageResponse } from "next/og";
import { api } from "~/trpc/server";

// Dynamic social-share card for a public form. Rendered at request time so the
// title/description always reflect the live form.
export const runtime = "nodejs";
export const alt = "Schema form";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let title = "Schema";
    let description = "Build forms people actually want to fill.";
    try {
        const form = await api.submission.getPublicForm.query({ formId: slug });
        title = form.title || title;
        if (form.description) description = form.description;
    } catch {
        // Form missing/unpublished → fall back to brand defaults.
    }

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: "#0a0a0a",
                    padding: "80px",
                    color: "#fafafa",
                }}
            >
                <div style={{ display: "flex", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>
                    Schema
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div
                        style={{
                            display: "flex",
                            fontSize: 72,
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: "-0.03em",
                            // Clamp long titles so the layout never overflows.
                            maxHeight: 250,
                            overflow: "hidden",
                        }}
                    >
                        {title.slice(0, 90)}
                    </div>
                    {description && (
                        <div style={{ display: "flex", fontSize: 32, color: "#a1a1aa", maxHeight: 90, overflow: "hidden" }}>
                            {description.slice(0, 120)}
                        </div>
                    )}
                </div>
                <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa" }}>
                    Powered by Schema
                </div>
            </div>
        ),
        { ...size },
    );
}
