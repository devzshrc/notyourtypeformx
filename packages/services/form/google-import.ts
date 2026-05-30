// Import a published Google Form by URL.
//
// A published Google Form page embeds the entire form definition as a JS global
// `var FB_PUBLIC_LOAD_DATA_ = [ ... ];`. It is an undocumented, position-based nested
// array. We fetch the page server-side, extract that array, and map it to our field
// model. ALL index access lives here and is defensively guarded — a shape change must
// degrade to a friendly error, never a 500.

export type ImportedFieldType =
    | "TEXT" | "EMAIL" | "NUMBER" | "LONG_TEXT" | "MULTIPLE_CHOICE"
    | "CHECKBOXES" | "DROPDOWN" | "RATING" | "DATE" | "PHONE" | "WEBSITE" | "STATEMENT";

export interface ImportedField {
    label: string;
    description: string | null;
    type: ImportedFieldType;
    isRequired: boolean;
    options: string[];
}

export interface ParsedGoogleForm {
    title: string;
    description: string | null;
    fields: ImportedField[];
    /** Item labels we recognised but cannot represent (grids, file upload, media). */
    skipped: string[];
}

export class GoogleImportError extends Error {}

const ALLOWED_HOSTS = new Set(["docs.google.com", "forms.gle"]);
const MAX_FIELDS = 50;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — published form pages are well under this.

// Google item type code → our field type. Codes are reverse-engineered.
// Anything not listed is skipped (grid=7, page break=8, image=11, video=12, file=13).
const TYPE_MAP: Record<number, ImportedFieldType> = {
    0: "TEXT", // short answer (may be refined to EMAIL/NUMBER/etc. below)
    1: "LONG_TEXT", // paragraph
    2: "MULTIPLE_CHOICE", // radio
    3: "DROPDOWN", // list
    4: "CHECKBOXES", // checkboxes
    5: "RATING", // linear scale
    6: "STATEMENT", // section title / header (no input)
    9: "DATE", // date
    10: "TEXT", // time — no native type, store as text
    18: "RATING", // newer star-rating item
};

/**
 * Fetch the HTML of a public Google Form. Enforces an HTTPS host allowlist (SSRF guard),
 * follows `forms.gle` short links, rejects editor (`/edit`) URLs, and caps size/time.
 */
export async function fetchGoogleFormHtml(rawUrl: string): Promise<string> {
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        throw new GoogleImportError("That doesn't look like a valid URL.");
    }
    if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
        throw new GoogleImportError("Enter a Google Forms link (docs.google.com or forms.gle).");
    }
    if (url.pathname.endsWith("/edit") || url.pathname.includes("/edit")) {
        throw new GoogleImportError(
            "That's the editor link. Open Send → link (the /viewform URL) and paste that instead.",
        );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
        res = await fetch(url.toString(), {
            redirect: "follow",
            signal: controller.signal,
            headers: {
                // Forms serve a lightweight page to non-browser agents without the data blob.
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            },
        });
    } catch {
        throw new GoogleImportError("Couldn't reach Google Forms. Check the link and try again.");
    } finally {
        clearTimeout(timer);
    }

    // forms.gle redirects to docs.google.com — re-validate the final host.
    const finalHost = (() => {
        try {
            return new URL(res.url).hostname;
        } catch {
            return "";
        }
    })();
    if (finalHost && !ALLOWED_HOSTS.has(finalHost)) {
        throw new GoogleImportError("That link didn't resolve to a Google Form.");
    }
    if (!res.ok) {
        throw new GoogleImportError("Couldn't open this form. Make sure link sharing is on.");
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) throw new GoogleImportError("This form page is too large to import.");
    return new TextDecoder().decode(buf);
}

/** Extract and parse the `FB_PUBLIC_LOAD_DATA_` blob into our form shape. */
export function parseGoogleForm(html: string): ParsedGoogleForm {
    const match = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);/);
    if (!match || !match[1]) {
        throw new GoogleImportError(
            "Couldn't read this form. Make sure link sharing is on and you used the /viewform link.",
        );
    }

    let data: unknown;
    try {
        data = JSON.parse(match[1]);
    } catch {
        throw new GoogleImportError("Couldn't read this form's structure.");
    }

    const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
    const str = (v: unknown): string => (typeof v === "string" ? v : "");

    const root = arr(data);
    const formBlock = arr(root[1]);
    const items = arr(formBlock[1]);

    // Title: prefer the form-block title, fall back to <title>, then a default.
    const titleTag = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "";
    const rawTitle = str(formBlock[8]) || str(root[3]) || titleTag || "Imported form";
    const title = clamp(sanitize(rawTitle).replace(/\s*-\s*Google Forms\s*$/i, ""), 50) || "Imported form";
    const description = nullable(clamp(sanitize(str(formBlock[0])), 300));

    const fields: ImportedField[] = [];
    const skipped: string[] = [];

    for (const raw of items) {
        const it = arr(raw);
        const code = typeof it[3] === "number" ? (it[3] as number) : -1;
        const label = clamp(sanitize(str(it[1])), 100);
        const mapped = TYPE_MAP[code];

        if (!mapped) {
            if (label) skipped.push(label);
            continue;
        }

        const question = arr(arr(it[4])[0]);
        const isRequired = question[2] === 1 || question[2] === true;
        const options = arr(question[1])
            .map((o) => clamp(sanitize(str(arr(o)[0])), 200))
            .filter((o) => o.length > 0);

        let type = mapped;
        // Short answer: refine via text-validation blob, then label keyword as fallback.
        if (code === 0) type = refineShortAnswer(question, label);

        // Choice types with no options are useless — demote to TEXT.
        if (["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"].includes(type) && options.length === 0) {
            type = "TEXT";
        }

        if (!label && type !== "STATEMENT") continue; // unlabeled input → skip silently

        fields.push({
            label: label || "Section",
            description: nullable(clamp(sanitize(str(it[2])), 300)),
            type,
            isRequired,
            options: ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"].includes(type) ? options : [],
        });

        if (fields.length >= MAX_FIELDS) break;
    }

    if (fields.length === 0) {
        throw new GoogleImportError("No importable questions found in this form.");
    }
    return { title, description, fields, skipped };
}

// Google text-validation blob: question[4] = [[ type, subType, ... ]].
// type 2 = text; subType 100 = email, 101 = url. type 1 = number.
function refineShortAnswer(question: unknown[], label: string): ImportedFieldType {
    const v = Array.isArray(question[4]) ? (question[4] as unknown[]) : [];
    const rule = Array.isArray(v[0]) ? (v[0] as unknown[]) : [];
    const vType = rule[0];
    const vSub = rule[1];
    if (vType === 1) return "NUMBER";
    if (vType === 2 && vSub === 100) return "EMAIL";
    if (vType === 2 && vSub === 101) return "WEBSITE";

    const l = label.toLowerCase();
    if (/\be-?mail\b/.test(l)) return "EMAIL";
    if (/\b(phone|mobile|contact number|whatsapp)\b/.test(l)) return "PHONE";
    if (/\b(website|url|link)\b/.test(l)) return "WEBSITE";
    return "TEXT";
}

function sanitize(s: string): string {
    // Mirror services/common/utils.stripUnsafe; kept local so the parser is dependency-free.
    return s.replace(/javascript:/gi, "").replace(/<[^>]*>/g, "").trim();
}
function clamp(s: string, max: number): string {
    return s.length > max ? s.slice(0, max) : s;
}
function nullable(s: string): string | null {
    return s.length > 0 ? s : null;
}
