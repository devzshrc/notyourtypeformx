
import { trpc } from "~/trpc/client"
export function useSignup() {
    const {
        mutateAsync: createUserWithEmailAndPasswordAsync,
        mutate: createUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status
    } = trpc.auth.createUserWithEmailAndPassword.useMutation();
    return {
        createUserWithEmailAndPasswordAsync,
        createUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status
    }
}