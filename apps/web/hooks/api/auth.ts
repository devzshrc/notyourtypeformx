import { trpc } from "~/trpc/client";
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
    } = trpc.auth.getLoggedInUserInfo.useQuery();
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
            await utils.auth.getLoggedInUserInfo.invalidate();
        },
    });
    return { logoutAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
