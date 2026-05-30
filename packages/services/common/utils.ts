// Shared string helpers used across form/form-field services.

/** Normalize a human label into a stable key (lowercase, underscores). */
export function toLabelKey(label: string): string {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/** Build a URL-safe slug from a title with a short random suffix for uniqueness. */
export function slugify(title: string): string {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    return `${base || "form"}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Strip HTML/script/`javascript:` from untrusted content before it is stored or rendered. */
export function stripUnsafe(s: string): string {
    return s.replace(/javascript:/gi, "").replace(/<[^>]*>/g, "").trim();
}
