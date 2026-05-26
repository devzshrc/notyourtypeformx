import { UtensilsIcon } from "lucide-react";
import { trpc } from "~/trpc/client";

export function useCreateForm() {
    const utils = trpc.useUtils();
    const {
        mutateAsync: createFormAsync,
        mutate: createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    } = trpc.form.createForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });
    return {
        createFormAsync,
        createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        isPending,
        status,
    };
}

export function useListForms() {
    const { data: forms, error, isFetching, isLoading, status } = trpc.form.listForms.useQuery();
    return { forms, error, isFetching, isLoading, status };
}
