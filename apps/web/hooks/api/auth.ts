import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "~/trpc/client";

/**
 * Whitelist post-auth redirect targets to same-origin relative paths only.
 * Rejects absolute URLs and protocol-relative `//evil.com` (open-redirect → phishing).
 */
export function safeRedirect(raw: string | null | undefined): string {
    if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "/dashboard";
}

/** Set the web-domain session marker so middleware allows /dashboard access. */
export async function markSession() {
    await fetch("/api/auth/session", { method: "POST" });
}

/** Clear the web-domain session marker on logout. */
async function clearSession() {
    await fetch("/api/auth/session", { method: "DELETE" });
}

export function useSignup() {
    const utils = trpc.useUtils();
    const {
        mutateAsync: createUserWithEmailAndPasswordAsync,
        mutate: createUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    } = trpc.auth.createUserWithEmailAndPassword.useMutation({
        onSuccess: async () => {
            await markSession();
            await utils.auth.getLoggedInUserInfo.invalidate();
        },
    });
    return {
        createUserWithEmailAndPasswordAsync,
        createUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    };
}
export function useSignin() {
    const utils = trpc.useUtils();
    const {
        mutateAsync: signInUserWithEmailAndPasswordAsync,
        mutate: signInUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
        onSuccess: async () => {
            await markSession();
            await utils.auth.getLoggedInUserInfo.invalidate();
        },
    });
    return {
        signInUserWithEmailAndPasswordAsync,
        signInUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    };
}

export function useUser() {
    const {
        data: user,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.auth.getLoggedInUserInfo.useQuery(undefined, {
        retry: false,
    });
    return {
        data: user,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
}

export function useLogout() {
    const queryClient = useQueryClient();
    const mutation = trpc.auth.logout.useMutation({
        // Runs even if the API logout fails (e.g. token already expired) so the UI
        // never gets stuck "logged in". Wipe the entire query cache — the global
        // client uses staleTime: Infinity, so a stale user/dashboard would otherwise
        // linger until a hard refresh, and switching accounts would show prior data.
        onSettled: async () => {
            await clearSession();
            queryClient.clear();
        },
    });
    return { logoutAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
