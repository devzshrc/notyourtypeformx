"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useGoogleSignIn, safeRedirect } from "~/hooks/api/auth";
import { env } from "~/env.js";

/**
 * "Continue with Google" — uses Google's officially rendered button + the ID-token
 * (credential) flow. No popup window, so it can't be killed by popup blockers. The
 * returned credential is a signed ID token (JWT) verified server-side with
 * google-auth-library. Renders nothing when no client id is configured.
 */
export function GoogleAuthButton() {
    if (!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
    return <GoogleAuthButtonInner />;
}

function GoogleAuthButtonInner() {
    const router = useRouter();
    const params = useSearchParams();
    const { resolvedTheme } = useTheme();
    const { signInWithGoogleAsync } = useGoogleSignIn();

    const handleSuccess = async (resp: CredentialResponse) => {
        if (!resp.credential) {
            toast.error("Google sign-in failed. Please try again.");
            return;
        }
        try {
            await signInWithGoogleAsync({ idToken: resp.credential });
            router.replace(safeRedirect(params.get("redirect")));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Google sign-in failed.");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border/60" />
            </div>
            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => toast.error("Google sign-in failed. Please try again.")}
                    theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
                    text="continue_with"
                    shape="rectangular"
                    width="320"
                />
            </div>
        </div>
    );
}
