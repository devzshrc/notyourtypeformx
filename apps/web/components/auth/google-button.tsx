"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useGoogleSignIn, safeRedirect } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Loader2 } from "~/components/icons";
import { env } from "~/env.js";

function GoogleGlyph() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z" />
        </svg>
    );
}

/**
 * "Continue with Google" — fully custom button. Uses the implicit access-token flow;
 * the token is verified server-side (audience + email_verified). Renders nothing when
 * no client id is configured.
 */
export function GoogleAuthButton() {
    if (!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
    return <GoogleAuthButtonInner />;
}

function GoogleAuthButtonInner() {
    const router = useRouter();
    const params = useSearchParams();
    const { signInWithGoogleAsync } = useGoogleSignIn();
    const [loading, setLoading] = useState(false);

    const login = useGoogleLogin({
        onSuccess: async (resp) => {
            try {
                await signInWithGoogleAsync({ accessToken: resp.access_token });
                router.replace(safeRedirect(params.get("redirect")));
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Google sign-in failed.");
                setLoading(false);
            }
        },
        onError: () => {
            toast.error("Google sign-in failed. Please try again.");
            setLoading(false);
        },
        onNonOAuthError: () => setLoading(false),
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border/60" />
            </div>
            <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-2.5 font-medium"
                disabled={loading}
                onClick={() => {
                    setLoading(true);
                    login();
                }}
            >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <GoogleGlyph />}
                Continue with Google
            </Button>
        </div>
    );
}
