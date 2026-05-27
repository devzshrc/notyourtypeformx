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

export function useListForms(includeArchived?: boolean, workspaceId?: string) {
    const { data: forms, error, isFetching, isLoading, status } = trpc.form.listForms.useQuery({ includeArchived, workspaceId });
    return { forms, error, isFetching, isLoading, status };
}

export function useListWorkspaceForms(workspaceId: string | null) {
    const { data: forms, isLoading } = trpc.form.listForms.useQuery({ workspaceId: workspaceId!, includeArchived: true }, { enabled: !!workspaceId });
    return { forms, isLoading };
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
            await utils.form.getForm.invalidate();
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

export function useCloneForm() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.cloneForm.useMutation({
        onSuccess: async () => {
            await utils.form.listForms.invalidate();
        },
    });
    return { cloneFormAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useArchiveForm() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.archiveForm.useMutation({
        onSuccess: async () => {
            await utils.form.listForms.invalidate();
        },
    });
    return { archiveFormAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
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

export function useListSubmissions(formId: string, opts?: { limit?: number; offset?: number; startDate?: string; endDate?: string }) {
    const { data, error, isLoading } = trpc.submission.listSubmissions.useQuery({ formId, ...opts });
    return { submissions: data?.rows, total: data?.total ?? 0, error, isLoading };
}

export function useGetPublicForm(formId: string) {
    const { data: form, error, isLoading } = trpc.submission.getPublicForm.useQuery({ formId });
    return { form, error, isLoading };
}

export function useRecordEvent() {
    const mutation = trpc.submission.recordEvent.useMutation();
    return { recordEvent: mutation.mutate };
}

export function useGetAnalytics(formId: string, options?: { refetchInterval?: number }) {
    const { data: analytics, isLoading } = trpc.submission.getAnalytics.useQuery({ formId }, { enabled: !!formId, ...options });
    return { analytics, isLoading };
}

export function useSubmissionTimeSeries(formId: string, days?: number) {
    const { data: timeSeries, isLoading } = trpc.submission.getSubmissionTimeSeries.useQuery({ formId, days });
    return { timeSeries, isLoading };
}

export function useVerifyFormPassword() {
    const mutation = trpc.submission.verifyFormPassword.useMutation();
    return { verifyPasswordAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useAdminStats() {
    const { data: stats, isLoading } = trpc.submission.getAdminStats.useQuery();
    return { stats, isLoading };
}

export function useListPublicForms(onlyTemplates?: boolean) {
    const { data: forms, isLoading } = trpc.form.listPublicForms.useQuery({ onlyTemplates });
    return { forms, isLoading };
}

export function useClonePublicForm() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.clonePublicForm.useMutation({
        onSuccess: async () => { await utils.form.listForms.invalidate(); },
    });
    return { clonePublicFormAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useGenerateForm() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.generateForm.useMutation({
        onSuccess: async () => { await utils.form.listForms.invalidate(); },
    });
    return { generateFormAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useImproveField(formId: string) {
    const utils = trpc.useUtils();
    const mutation = trpc.form.improveField.useMutation({
        onSuccess: async () => { await utils.formField.listFields.invalidate({ formId }); },
    });
    return { improveFieldAsync: mutation.mutateAsync, isPending: mutation.isPending, improvingFieldId: mutation.variables?.fieldId ?? null };
}

export function useSuggestFields() {
    const mutation = trpc.form.suggestFields.useMutation();
    return { suggestFieldsAsync: mutation.mutateAsync, suggestions: mutation.data?.suggestions, isPending: mutation.isPending, error: mutation.error };
}

export function useUpdateSlug() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.updateSlug.useMutation({ onSuccess: () => { utils.form.getForm.invalidate(); } });
    return { updateSlugAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useMoveForm() {
    const utils = trpc.useUtils();
    const mutation = trpc.form.moveForm.useMutation({ onSuccess: () => { utils.form.listForms.invalidate(); } });
    return { moveFormAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}
