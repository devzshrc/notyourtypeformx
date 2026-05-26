import { trpc } from "~/trpc/client";

export function useCreateForm() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.createForm.useMutation({
        onSuccess: async () => {
            await utils.form.listForms.invalidate();
        },
    });
    return {
        createFormAsync: mutation.mutateAsync,
        createForm: mutation.mutate,
        error: mutation.error,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        status: mutation.status,
    };
}

export function useListForms() {
    const { data: forms, error, isFetching, isLoading, status } = trpc.form.listForms.useQuery();
    return { forms, error, isFetching, isLoading, status };
}

export function useGetForm(formId: string) {
    const { data: form, error, isLoading, status } = trpc.form.getForm.useQuery({ formId });
    return { form, error, isLoading, status };
}

export function useUpdateForm() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.updateForm.useMutation({
        onSuccess: async () => {
            await utils.form.listForms.invalidate();
        },
    });
    return { updateFormAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useDeleteForm() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.deleteForm.useMutation({
        onSuccess: async () => {
            await utils.form.listForms.invalidate();
        },
    });
    return { deleteFormAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

// Form Fields
export function useListFields(formId: string) {
    const { data: fields, error, isLoading } = trpc.formField.listFields.useQuery({ formId });
    return { fields, error, isLoading };
}

export function useAddField() {
    const utils = trpc.useUtils();
    const mutation = trpc.formField.addField.useMutation({
        onSuccess: async (_data, variables) => {
            await utils.formField.listFields.invalidate({ formId: variables.formId });
        },
    });
    return { addFieldAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useUpdateField() {
    const utils = trpc.useUtils();
    const mutation = trpc.formField.updateField.useMutation({
        onSuccess: async (_data, variables) => {
            await utils.formField.listFields.invalidate({ formId: variables.formId });
        },
    });
    return { updateFieldAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useDeleteField() {
    const utils = trpc.useUtils();
    const mutation = trpc.formField.deleteField.useMutation({
        onSuccess: async (_data, variables) => {
            await utils.formField.listFields.invalidate({ formId: variables.formId });
        },
    });
    return { deleteFieldAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useReorderFields() {
    const utils = trpc.useUtils();
    const mutation = trpc.formField.reorderFields.useMutation({
        onSuccess: async (_data, variables) => {
            await utils.formField.listFields.invalidate({ formId: variables.formId });
        },
    });
    return { reorderFieldsAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

// Submissions
export function useSubmitForm() {
    const mutation = trpc.submission.submitForm.useMutation();
    return { submitFormAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error, isSuccess: mutation.isSuccess };
}

export function useListSubmissions(formId: string) {
    const { data: submissions, error, isLoading } = trpc.submission.listSubmissions.useQuery({ formId });
    return { submissions, error, isLoading };
}

export function useGetPublicForm(formId: string) {
    const { data: form, error, isLoading } = trpc.submission.getPublicForm.useQuery({ formId });
    return { form, error, isLoading };
}
