"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useGetPublicForm, useSubmitForm, useRecordEvent } from "~/hooks/api/form";
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
    return null;
}

export default function PublicFormPage() {
    const params = useParams<{ id: string }>();
    const formId = params.id;

    const { form, isLoading, error: fetchError } = useGetPublicForm(formId);
    const { submitFormAsync, isPending, isSuccess, error: submitError } = useSubmitForm();
    const { recordEvent } = useRecordEvent();
    const viewedRef = useRef(false);
    const startedRef = useRef(false);

    const [hasWelcome, setHasWelcome] = useState(false);
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [history, setHistory] = useState<number[]>([]);
    const [formData, setFormData] = useState<Record<string, AnswerValue>>({});
    const [fieldError, setFieldError] = useState<string | null>(null);

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
    }, [form]);

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <p className="text-muted-foreground">Loading form...</p>
            </main>
        );
    }

    if (fetchError || !form) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <p className="text-destructive">Form not found.</p>
            </main>
        );
    }

    const fields = form.fields as Field[];
    const isDraft = form.status !== "PUBLISHED";

    if (isSuccess) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
                <div className="max-w-lg text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {form.endingTitle || "Thank you!"}
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        {form.endingDescription || "Your response has been submitted."}
                    </p>
                </div>
            </main>
        );
    }

    if (hasWelcome && !started) {
        return (
            <main className="relative flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
                {isDraft && <DraftBanner />}
                <div className="max-w-lg text-center">
                    <h1 className="text-4xl font-semibold tracking-tight">{form.welcomeTitle}</h1>
                    {form.welcomeDescription && (
                        <p className="mt-4 text-lg text-muted-foreground">{form.welcomeDescription}</p>
                    )}
                    <Button onClick={() => setStarted(true)} className="mt-8 px-8">
                        Start <ArrowRight className="ml-2 size-4" />
                    </Button>
                </div>
            </main>
        );
    }

    if (fields.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <p className="text-muted-foreground">This form has no questions yet.</p>
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
            const hasScores = fields.some((f) => f.scores);
            const payload = hasScores ? { ...formData, __score: String(computeScore(formData)) } : formData;
            await submitFormAsync({ formId, data: payload });
            return;
        }
        setHistory((h) => [...h, step]);
        setStep(next);
        setFieldError(null);
    };

    const goBack = () => {
        setFieldError(null);
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

    const advanceOnEnter = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void goNext();
        }
    };

    const progress = ((step + 1) / fields.length) * 100;

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
                    <div className="flex gap-3">
                        {["yes", "no"].map((opt) => (
                            <button
                                key={opt}
                                type="button"
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
                    <div className="flex flex-col gap-2">
                        {field.options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
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
                    <div className="flex flex-col gap-2">
                        {field.options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
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
                    <div className="flex gap-2">
                        {Array.from({ length: RATING_MAX }, (_, i) => i + 1).map((n) => (
                            <button key={n} type="button" onClick={() => setValue(String(n))}>
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
                        onKeyDown={advanceOnEnter}
                        className="rounded-none border-0 border-b bg-transparent px-0 text-xl focus-visible:ring-0"
                    />
                );
        }
    };

    return (
        <main className="relative flex min-h-screen flex-col bg-background text-foreground">
            {isDraft && <DraftBanner />}
            <Progress value={progress} className="h-1 rounded-none" />

            <div className="flex flex-1 items-center justify-center px-6">
                <div className="w-full max-w-xl">
                    <p className="mb-2 text-sm text-muted-foreground">
                        {step + 1} of {fields.length}
                    </p>
                    <label className="block text-2xl font-medium tracking-tight">
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
                </div>
            </div>
        </main>
    );
}

function DraftBanner() {
    return (
        <div className="absolute left-0 right-0 top-0 z-10 bg-yellow-500/15 py-2 text-center text-xs font-medium text-yellow-600 dark:text-yellow-400">
            Draft preview — not published. Responses are disabled.
        </div>
    );
}
