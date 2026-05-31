"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Star, Lock, Loader2, AlertCircle, Inbox } from "~/components/icons";
import { AnimatePresence, motion } from "~/components/motion";
import { useSwipeable } from "react-swipeable";
import { useTheme } from "next-themes";
import confetti from "canvas-confetti";
import { useGetPublicForm, useSubmitForm, useRecordEvent, useVerifyFormPassword } from "~/hooks/api/form";
import { formThemesLight, formThemesDark, getThemeBackgroundImage, type FormTheme } from "~/lib/form-themes";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Progress } from "~/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";

// Only follow http(s) redirects — blocks javascript:/data: URIs from a malicious form config.
function isSafeRedirect(url: string): boolean {
    try {
        const proto = new URL(url, window.location.origin).protocol;
        return proto === "http:" || proto === "https:";
    } catch {
        return false;
    }
}

type FieldType =
    | "TEXT"
    | "EMAIL"
    | "NUMBER"
    | "YES_NO"
    | "PASSWORD"
    | "LONG_TEXT"
    | "MULTIPLE_CHOICE"
    | "CHECKBOXES"
    | "DROPDOWN"
    | "RATING"
    | "DATE"
    | "PHONE"
    | "WEBSITE"
    | "STATEMENT";

type Field = {
    id: string;
    label: string;
    labelKey: string;
    description: string | null;
    placeholder: string | null;
    isRequired: boolean;
    type: FieldType;
    index: string;
    options: string[];
    logic: { equals: string; goTo: string }[] | null;
    scores: Record<string, number> | null;
    validation: { minLength?: number; maxLength?: number; min?: number; max?: number; pattern?: string } | null;
};

function pipe(text: string, data: Record<string, AnswerValue>): string {
    return text.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_m, key: string) => {
        const v = data[key];
        if (v === undefined) return "";
        return Array.isArray(v) ? v.join(", ") : v;
    });
}

type AnswerValue = string | string[];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]+$/;
const RATING_MAX = 5;

function isEmpty(v: AnswerValue | undefined): boolean {
    if (v === undefined) return true;
    if (Array.isArray(v)) return v.length === 0;
    return v.trim() === "";
}

function validateField(field: Field, value: AnswerValue | undefined): string | null {
    if (field.type === "STATEMENT") return null;
    if (field.isRequired && isEmpty(value)) return "This field is required.";
    if (isEmpty(value)) return null;
    const s = typeof value === "string" ? value.trim() : "";
    if (field.type === "EMAIL" && !EMAIL_RE.test(s)) return "Enter a valid email address.";
    if (field.type === "NUMBER" && Number.isNaN(Number(s))) return "Enter a valid number.";
    if (field.type === "WEBSITE" && !URL_RE.test(s)) return "Enter a valid URL (https://...).";
    // Custom per-field rules
    const v = field.validation;
    if (v && typeof value === "string") {
        const len = s.length;
        if (v.minLength != null && len < v.minLength) return `Must be at least ${v.minLength} characters.`;
        if (v.maxLength != null && len > v.maxLength) return `Must be at most ${v.maxLength} characters.`;
        if (field.type === "NUMBER") {
            const n = Number(s);
            if (v.min != null && n < v.min) return `Must be ${v.min} or more.`;
            if (v.max != null && n > v.max) return `Must be ${v.max} or less.`;
        }
        if (v.pattern) {
            try { if (!new RegExp(v.pattern).test(s)) return "Invalid format."; } catch { /* ignore bad regex */ }
        }
    }
    return null;
}

const slideVariants = {
    enter: (dir: "forward" | "backward") => ({ x: dir === "forward" ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.25, ease: "easeOut" as const } },
    exit: (dir: "forward" | "backward") => ({ x: dir === "forward" ? -60 : 60, opacity: 0, transition: { duration: 0.18, ease: "easeIn" as const } }),
};

export default function PublicFormPage() {
    // Rendered at both /form/[id] and /f/[slug]; getPublicForm accepts slug-or-uuid.
    const params = useParams<{ id?: string; slug?: string }>();
    const formId = params.id ?? params.slug ?? "";

    const { form, isLoading, error: fetchError } = useGetPublicForm(formId);
    const { submitFormAsync, isPending, isSuccess, error: submitError } = useSubmitForm();
    const { recordEvent } = useRecordEvent();
    const { verifyPasswordAsync, isPending: verifyingPassword } = useVerifyFormPassword();
    const { resolvedTheme } = useTheme();
    const viewedRef = useRef(false);
    const startedRef = useRef(false);

    const [passwordUnlocked, setPasswordUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [hasWelcome, setHasWelcome] = useState(false);
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState<"forward" | "backward">("forward");
    const [history, setHistory] = useState<number[]>([]);
    const [formData, setFormData] = useState<Record<string, AnswerValue>>({});
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [showResume, setShowResume] = useState(false);
    // Anti-spam: hidden honeypot input + min fill time. Bots fill hidden fields and
    // submit instantly; real users don't touch the honeypot and take >2s.
    const [honeypot, setHoneypot] = useState("");
    const mountTimeRef = useRef(Date.now());

    const draftKey = `schema-draft-${formId}`;

    useEffect(() => {
        if (!form) return;
        if (!viewedRef.current && form.status === "PUBLISHED") {
            viewedRef.current = true;
            recordEvent({ formId: form.id, type: "VIEW" });
        }
        setHasWelcome(Boolean(form.welcomeTitle));
        // Capture hidden fields from URL query params
        const keys = form.hiddenFields ?? [];
        if (keys.length > 0) {
            const sp = new URLSearchParams(window.location.search);
            const seed: Record<string, AnswerValue> = {};
            for (const k of keys) {
                const v = sp.get(k);
                if (v !== null) seed[k] = v;
            }
            if (Object.keys(seed).length > 0) setFormData((prev) => ({ ...seed, ...prev }));
        }
        // Check for saved draft
        try {
            const saved = localStorage.getItem(draftKey);
            if (saved) {
                const draft = JSON.parse(saved) as { step: number; history: number[]; formData: Record<string, AnswerValue>; started: boolean };
                if (draft.step > 0 || Object.keys(draft.formData).length > 0) {
                    setShowResume(true);
                }
            }
        } catch { /* ignore */ }
        // Runs once per form load; draftKey is constant and recordEvent is a stable mutation fn.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form]);

    // Auto-save draft to localStorage when progress changes
    useEffect(() => {
        if (!started || submitted) return;
        try {
            localStorage.setItem(draftKey, JSON.stringify({ step, history, formData, started }));
        } catch { /* ignore */ }
        // draftKey is constant per form; intentionally excluded.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, history, formData, started, submitted]);

    // Mobile swipe handlers (must be called before any early returns to preserve hook order)
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => void goNextRef.current?.(),
        onSwipedRight: () => goBackRef.current?.(),
        preventScrollOnSwipe: true,
        trackMouse: false,
    });

    // Embed auto-resize: when rendered inside a host iframe (?embed=1), post our
    // real content height to the parent so the iframe can size to fit.
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("embed") !== "1") return;
        const post = () => {
            window.parent.postMessage(
                { type: "schema-form-resize", height: document.documentElement.scrollHeight },
                "*",
            );
        };
        post();
        const ro = new ResizeObserver(post);
        ro.observe(document.documentElement);
        return () => ro.disconnect();
    }, []);

    // Global Enter key handler
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            // Skip for LONG_TEXT (Enter = newline there)
            if (e.key !== "Enter" || e.shiftKey) return;
            const tag = (e.target as HTMLElement).tagName;
            if (tag === "TEXTAREA") return;
            e.preventDefault();
            void goNextRef.current?.();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    if (isLoading) {
        return (
            <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background px-6 text-foreground">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading form</p>
            </main>
        );
    }

    if (fetchError || !form) {
        return (
            <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="size-6 text-muted-foreground" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold">Form not found</h1>
                    <p className="mt-1 text-sm text-muted-foreground">This form may have been unpublished or the link is incorrect.</p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/">Back to home</Link>
                </Button>
            </main>
        );
    }

    const fields = form.fields as Field[];
    const isDraft = form.status !== "PUBLISHED";

    // Per-form theme CSS vars (computed early so all screens get themed)
    const themeKey = (form.theme ?? "bold-tech") as FormTheme;
    const themeVars = resolvedTheme === "dark"
        ? (formThemesDark[themeKey] ?? {})
        : (formThemesLight[themeKey] ?? {});
    const themeBg = getThemeBackgroundImage(themeKey);

    // Password gate
    if (form.hasPassword && !passwordUnlocked) {
        const handlePasswordSubmit = async () => {
            setPasswordError("");
            try {
                const result = await verifyPasswordAsync({ formId: form.id, password: passwordInput });
                if (result.valid) {
                    setPasswordUnlocked(true);
                } else {
                    setPasswordError("Incorrect password");
                }
            } catch {
                setPasswordError("Something went wrong. Please try again.");
            }
        };
        return (
            <main style={themeVars as React.CSSProperties} className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-foreground">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <Lock className="mx-auto size-10 text-muted-foreground" />
                    <h1 className="text-2xl font-semibold">This form is password protected</h1>
                    <p className="text-sm text-muted-foreground">Enter the password to access this form.</p>
                    <Input
                        type="password"
                        placeholder="Enter password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") void handlePasswordSubmit(); }}
                    />
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    <Button onClick={handlePasswordSubmit} disabled={verifyingPassword || !passwordInput.trim()} className="w-full">
                        {verifyingPassword ? "Verifying..." : "Unlock Form"}
                    </Button>
                </div>
            </main>
        );
    }

    if (isSuccess || submitted) {
        return (
            <main style={themeVars as React.CSSProperties} className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-foreground">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-lg text-center"
                >
                    {/* 礼 (rei) — gratitude, in an ensō; omotenashi for the respondent */}
                    <div className="enso mx-auto mb-6 flex size-16 items-center justify-center rounded-full">
                        <span className="text-2xl text-primary/70">礼</span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {form.endingTitle ? pipe(form.endingTitle, formData) : "Thank you!"}
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        {form.endingDescription ? pipe(form.endingDescription, formData) : "Your response has been submitted."}
                    </p>
                    <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                        一期一会 — one meeting, treasured
                    </p>
                </motion.div>
            </main>
        );
    }

    const resumeDraft = () => {
        try {
            const saved = localStorage.getItem(draftKey);
            if (saved) {
                const draft = JSON.parse(saved) as { step: number; history: number[]; formData: Record<string, AnswerValue>; started: boolean };
                setStep(draft.step);
                setHistory(draft.history);
                setFormData(draft.formData);
                setStarted(true);
                setShowResume(false);
            }
        } catch { /* ignore */ }
    };

    const discardDraft = () => {
        try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
        setShowResume(false);
    };

    if (hasWelcome && !started) {
        return (
            <main style={themeVars as React.CSSProperties} className="relative flex min-h-[100dvh] items-center justify-center bg-background px-6 text-foreground">
                {isDraft && <DraftBanner />}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-lg text-center"
                >
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{form.welcomeTitle}</h1>
                    {form.welcomeDescription && (
                        <p className="mt-4 text-lg text-muted-foreground">{form.welcomeDescription}</p>
                    )}
                    {showResume ? (
                        <div className="mt-8 flex flex-col items-center gap-3">
                            <p className="text-sm text-muted-foreground">You have a saved draft for this form.</p>
                            <div className="flex gap-3">
                                <Button onClick={resumeDraft} className="px-6">Continue where you left off</Button>
                                <Button variant="outline" onClick={() => { discardDraft(); setStarted(true); }}>Start fresh</Button>
                            </div>
                        </div>
                    ) : (
                        <Button onClick={() => setStarted(true)} className="mt-8 px-8">
                            Start <ArrowRight className="ml-2 size-4" />
                        </Button>
                    )}
                </motion.div>
            </main>
        );
    }

    if (fields.length === 0) {
        return (
            <main style={themeVars as React.CSSProperties} className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Inbox className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">This form has no questions yet.</p>
            </main>
        );
    }

    const field = fields[step]!;
    const currentValue = formData[field.labelKey];
    const currentStr = typeof currentValue === "string" ? currentValue : "";
    const currentArr = Array.isArray(currentValue) ? currentValue : [];

    const setValue = (value: AnswerValue) => {
        if (!startedRef.current && form.status === "PUBLISHED") {
            startedRef.current = true;
            recordEvent({ formId: form.id, type: "START" });
        }
        setFormData((prev) => ({ ...prev, [field.labelKey]: value }));
        if (fieldError) setFieldError(null);
    };

    const computeScore = (data: Record<string, AnswerValue>): number => {
        let total = 0;
        for (const f of fields) {
            if (!f.scores) continue;
            const v = data[f.labelKey];
            if (typeof v === "string") total += f.scores[v] ?? 0;
            else if (Array.isArray(v)) for (const item of v) total += f.scores[item] ?? 0;
        }
        return total;
    };

    const toggleCheckbox = (opt: string) => {
        const next = currentArr.includes(opt)
            ? currentArr.filter((o) => o !== opt)
            : [...currentArr, opt];
        setValue(next);
    };

    const resolveNext = (): number | "END" => {
        const answer = typeof currentValue === "string" ? currentValue : "";
        const rule = field.logic?.find((r) => r.equals === answer);
        if (rule) {
            if (rule.goTo === "END") return "END";
            const idx = fields.findIndex((f) => f.id === rule.goTo);
            if (idx !== -1) return idx;
        }
        return step + 1;
    };

    const nextStep = resolveNext();
    const willEnd = nextStep === "END" || nextStep >= fields.length;

    const goNext = async () => {
        const err = validateField(field, currentValue);
        if (err) {
            setFieldError(err);
            return;
        }
        const next = resolveNext();
        if (next === "END" || next >= fields.length) {
            // Bot heuristics: honeypot filled, or form completed implausibly fast.
            // Show the success screen but never hit the API — silently discards spam.
            if (honeypot.trim() !== "" || Date.now() - mountTimeRef.current < 2000) {
                try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
                setSubmitted(true);
                return;
            }
            const hasScores = fields.some((f) => f.scores);
            const payload = hasScores ? { ...formData, __score: String(computeScore(formData)) } : formData;
            try {
                await submitFormAsync({ formId: form.id, data: payload });
            } catch (e) {
                setFieldError(e instanceof Error ? e.message : "Failed to submit. Please try again.");
                return;
            }
            // Clear saved draft (best-effort; storage may be unavailable in private mode)
            try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
            // Confetti on success
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            // Redirect if configured (only http/https), otherwise show ending screen
            if (form.redirectUrl && isSafeRedirect(form.redirectUrl)) {
                window.location.href = form.redirectUrl;
                return;
            }
            setSubmitted(true);
            return;
        }
        setDirection("forward");
        setHistory((h) => [...h, step]);
        setStep(next);
        setFieldError(null);
    };

    // Store goNext in ref for global keyboard handler
    goNextRef.current = goNext;

    const goBack = () => {
        setFieldError(null);
        setDirection("backward");
        if (history.length === 0) {
            if (hasWelcome) setStarted(false);
            return;
        }
        setHistory((h) => {
            const prev = h[h.length - 1]!;
            setStep(prev);
            return h.slice(0, -1);
        });
    };
    goBackRef.current = goBack;

    const progress = ((step + 1) / fields.length) * 100;



    // Show keyboard hint for simple text inputs
    const showEnterHint = !["STATEMENT", "LONG_TEXT", "MULTIPLE_CHOICE", "CHECKBOXES", "YES_NO", "RATING", "DROPDOWN"].includes(field.type);

    const renderInput = () => {
        switch (field.type) {
            case "STATEMENT":
                return null;
            case "LONG_TEXT":
                return (
                    <Textarea
                        autoFocus
                        placeholder={field.placeholder ?? ""}
                        value={currentStr}
                        onChange={(e) => setValue(e.target.value)}
                        className="text-lg"
                    />
                );
            case "YES_NO":
                return (
                    <div className="flex gap-3" role="radiogroup" aria-label={field.label}>
                        {["yes", "no"].map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                role="radio"
                                aria-checked={currentStr === opt}
                                onClick={() => setValue(opt)}
                                className={`flex-1 rounded-md border px-4 py-3 text-left capitalize transition ${
                                    currentStr === opt
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card hover:bg-accent hover:text-accent-foreground"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                );
            case "MULTIPLE_CHOICE":
                return (
                    <div className="flex flex-col gap-2" role="radiogroup" aria-label={field.label}>
                        {field.options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                role="radio"
                                aria-checked={currentStr === opt}
                                onClick={() => setValue(opt)}
                                className={`rounded-md border px-4 py-3 text-left transition ${
                                    currentStr === opt
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card hover:bg-accent hover:text-accent-foreground"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                );
            case "CHECKBOXES":
                return (
                    <div className="flex flex-col gap-2" role="group" aria-label={field.label}>
                        {field.options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                role="checkbox"
                                aria-checked={currentArr.includes(opt)}
                                onClick={() => toggleCheckbox(opt)}
                                className={`rounded-md border px-4 py-3 text-left transition ${
                                    currentArr.includes(opt)
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card hover:bg-accent hover:text-accent-foreground"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                );
            case "DROPDOWN":
                return (
                    <Select value={currentStr} onValueChange={(v) => setValue(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder={field.placeholder ?? "Select..."} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case "RATING":
                return (
                    <div className="flex gap-2" role="group" aria-label="Rating">
                        {Array.from({ length: RATING_MAX }, (_, i) => i + 1).map((n) => (
                            <button key={n} type="button" onClick={() => setValue(String(n))} aria-label={`Rate ${n} out of ${RATING_MAX}`}>
                                <Star
                                    className={`size-9 transition ${
                                        Number(currentStr) >= n
                                            ? "fill-primary text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                );
            default:
                return (
                    <Input
                        autoFocus
                        type={
                            field.type === "EMAIL"
                                ? "email"
                                : field.type === "NUMBER"
                                  ? "number"
                                  : field.type === "PASSWORD"
                                    ? "password"
                                    : field.type === "DATE"
                                      ? "date"
                                      : field.type === "PHONE"
                                        ? "tel"
                                        : field.type === "WEBSITE"
                                          ? "url"
                                          : "text"
                        }
                        placeholder={field.placeholder ?? ""}
                        value={currentStr}
                        onChange={(e) => setValue(e.target.value)}
                        className="rounded-none border-0 border-b bg-transparent px-0 text-xl focus-visible:ring-0"
                    />
                );
        }
    };

    return (
        <main {...swipeHandlers} style={themeVars as React.CSSProperties} className="relative flex min-h-[100dvh] flex-col bg-background text-foreground">
            {/* Honeypot — hidden from users, tempting to bots. aria-hidden + off-screen. */}
            <input
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="pointer-events-none absolute -left-[9999px] size-0 opacity-0"
            />
            {themeBg && (
                <div
                    className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
                    style={{ backgroundImage: `url(${themeBg})` }}
                />
            )}
            {isDraft && <DraftBanner />}
            {showResume && !hasWelcome && (
                <div className="flex items-center justify-between bg-primary/10 px-4 py-2 text-sm">
                    <span className="text-foreground">You have a saved draft.</span>
                    <div className="flex gap-2">
                        <button type="button" onClick={resumeDraft} className="font-medium text-primary hover:underline">Resume</button>
                        <span className="text-muted-foreground">·</span>
                        <button type="button" onClick={discardDraft} className="text-muted-foreground hover:underline">Start fresh</button>
                    </div>
                </div>
            )}
            <Progress value={progress} className="h-1 rounded-none" />

            <div className="flex flex-1 items-center justify-center px-6">
                <div className="w-full max-w-xl">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            <p className="mb-2 text-sm text-muted-foreground">
                                {step + 1} of {fields.length}
                            </p>
                            <label className="block text-xl font-medium tracking-tight sm:text-2xl">
                                {pipe(field.label, formData)}
                                {field.isRequired && field.type !== "STATEMENT" && (
                                    <span className="ml-1 text-destructive">*</span>
                                )}
                            </label>
                            {field.description && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {pipe(field.description, formData)}
                                </p>
                            )}

                            <div className="mt-6">{renderInput()}</div>

                            {showEnterHint && (
                                <p className="mt-3 hidden text-xs text-muted-foreground sm:block">
                                    Press{" "}
                                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                                        Enter ↵
                                    </kbd>{" "}
                                    to continue
                                </p>
                            )}

                            {fieldError && <p className="mt-3 text-sm text-destructive">{fieldError}</p>}
                            {submitError && <p className="mt-3 text-sm text-destructive">{submitError.message}</p>}

                            <div className="mt-8 flex items-center gap-3">
                                <Button onClick={() => void goNext()} disabled={isPending || (willEnd && isDraft)} className="px-6">
                                    {willEnd ? (isPending ? "Submitting..." : "Submit") : field.type === "STATEMENT" ? "Continue" : "OK"}
                                    {!willEnd && <ArrowRight className="ml-2 size-4" />}
                                </Button>
                                {(history.length > 0 || hasWelcome) && (
                                    <Button variant="ghost" onClick={goBack}>
                                        <ArrowLeft className="mr-1 size-4" /> Back
                                    </Button>
                                )}
                            </div>
                            {willEnd && isDraft && (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Publish this form to accept responses.
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}

// Mutable ref for keyboard handler to access goNext without stale closure
const goNextRef: { current: (() => Promise<void>) | null } = { current: null };
const goBackRef: { current: (() => void) | null } = { current: null };

function DraftBanner() {
    return (
        <div className="absolute left-0 right-0 top-0 z-10 border-b border-border bg-secondary py-2 text-center text-xs font-medium text-secondary-foreground">
            Draft preview, not published. Responses are disabled.
        </div>
    );
}
