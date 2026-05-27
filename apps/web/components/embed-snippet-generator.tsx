"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Copy, CheckCircle } from "lucide-react";

interface Props {
    formId: string;
    baseUrl?: string;
}

export function EmbedSnippetGenerator({ formId, baseUrl = typeof window !== "undefined" ? window.location.origin : "" }: Props) {
    const [copied, setCopied] = useState<"iframe" | "script" | null>(null);

    const iframeSnippet = `<iframe src="${baseUrl}/embed/${formId}" width="100%" height="600" frameborder="0" style="border:none;"></iframe>`;
    const scriptSnippet = `<div id="schema-form-${formId}"></div>\n<script src="${baseUrl}/embed.js" data-schema-form-id="${formId}"></script>`;

    const copy = async (text: string, type: "iframe" | "script") => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary">iframe</Badge>
                    <Button variant="ghost" size="sm" onClick={() => copy(iframeSnippet, "iframe")}>
                        {copied === "iframe" ? <CheckCircle className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                        <span className="ml-1.5 text-xs">{copied === "iframe" ? "Copied" : "Copy"}</span>
                    </Button>
                </div>
                <Textarea readOnly value={iframeSnippet} className="font-mono text-xs h-16 resize-none" />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary">Script embed</Badge>
                    <Button variant="ghost" size="sm" onClick={() => copy(scriptSnippet, "script")}>
                        {copied === "script" ? <CheckCircle className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                        <span className="ml-1.5 text-xs">{copied === "script" ? "Copied" : "Copy"}</span>
                    </Button>
                </div>
                <Textarea readOnly value={scriptSnippet} className="font-mono text-xs h-20 resize-none" />
            </div>
        </div>
    );
}
