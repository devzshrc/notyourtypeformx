import { trpc } from "~/trpc/client";

/** Set the web-domain session marker so middleware allows /dashboard access. */
async function markSession() {
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

export function useGoogleSignIn() {
    const utils = trpc.useUtils();
    const {
        mutateAsync: signInWithGoogleAsync,
        mutate: signInWithGoogle,
        error,
        isError,
        isPending,
        isSuccess,
        status,
    } = trpc.auth.signInWithGoogle.useMutation({
        onSuccess: async () => {
            await markSession();
            await utils.auth.getLoggedInUserInfo.invalidate();
        },
    });
    return { signInWithGoogleAsync, signInWithGoogle, error, isError, isPending, isSuccess, status };
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
    const utils = trpc.useUtils();
    const mutation = trpc.auth.logout.useMutation({
        onSuccess: async () => {
            await clearSession();
            await utils.auth.getLoggedInUserInfo.invalidate();
        },
    });
    return { logoutAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
