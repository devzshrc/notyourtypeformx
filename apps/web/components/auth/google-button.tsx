"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { env } from "~/env.js";

// Minimal typings for the Google Identity Services client (loaded from gsi/client).
interface GisIdConfig {
    client_id: string;
    ux_mode?: "popup" | "redirect";
    login_uri?: string;
}
interface GisButtonConfig {
    type?: "standard" | "icon";
    theme?: "outline" | "filled_blue" | "filled_black";
    text?: "signin_with" | "signup_with" | "continue_with" | "signin";
    shape?: "rectangular" | "pill" | "circle" | "square";
    width?: number;
    logo_alignment?: "left" | "center";
}
interface GisIdApi {
    initialize(config: GisIdConfig): void;
    renderButton(parent: HTMLElement, options: GisButtonConfig): void;
}
declare global {
    interface Window {
        google?: { accounts: { id: GisIdApi } };
    }
}

/**
 * "Continue with Google" using the GIS **redirect** flow (NOT popup). On click Google
 * does a full-page navigation and POSTs a signed ID token (credential) to our server
 * endpoint /api/auth/google/callback. No popup window → cannot be killed by popup
 * blockers / Brave shields. Renders nothing when no client id is configured.
 */
export function GoogleAuthButton() {
    if (!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
    return <GoogleAuthButtonInner clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} />;
}

function GoogleAuthButtonInner({ clientId }: { clientId: string }) {
    const params = useSearchParams();
    const { resolvedTheme } = useTheme();
    const buttonRef = useRef<HTMLDivElement>(null);
    const [scriptReady, setScriptReady] = useState(false);

    useEffect(() => {
        const id = window.google?.accounts?.id;
        if (!scriptReady || !id || !buttonRef.current) return;

        // Carry the post-login redirect (e.g. /invite/{token}) through to the callback.
        const redirect = params.get("redirect");
        const loginUri = `${window.location.origin}/api/auth/google/callback${
            redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
        }`;

        id.initialize({ client_id: clientId, ux_mode: "redirect", login_uri: loginUri });
        buttonRef.current.replaceChildren(); // avoid duplicate buttons on re-render
        id.renderButton(buttonRef.current, {
            type: "standard",
            theme: resolvedTheme === "dark" ? "filled_black" : "outline",
            text: "continue_with",
            shape: "rectangular",
            width: 320,
            logo_alignment: "center",
        });
    }, [scriptReady, params, resolvedTheme, clientId]);

    return (
        <div className="flex flex-col gap-4">
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => setScriptReady(true)}
            />
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border/60" />
            </div>
            <div className="flex justify-center">
                <div ref={buttonRef} />
            </div>
        </div>
    );
}
