import { trpc } from "~/trpc/client";

export function useListCategories() {
    const { data: categories, isLoading } = trpc.template.listCategories.useQuery();
    return { categories, isLoading };
}

export function useListTemplates(opts?: { categoryId?: string; search?: string; limit?: number; offset?: number }) {
    const { data, isLoading } = trpc.template.listTemplates.useQuery(opts ?? {});
    return { templates: data?.templates, total: data?.total ?? 0, isLoading };
}

export function useGetTemplate(templateId: string) {
    const { data: template, isLoading } = trpc.template.getTemplate.useQuery({ templateId }, { enabled: !!templateId });
    return { template, isLoading };
}

export function usePublishAsTemplate() {
    const utils = trpc.useUtils();
    const mutation = trpc.template.publishAsTemplate.useMutation({ onSuccess: () => { utils.template.listTemplates.invalidate(); utils.form.listForms.invalidate(); } });
    return { publishAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useUnpublishTemplate() {
    const utils = trpc.useUtils();
    const mutation = trpc.template.unpublishTemplate.useMutation({ onSuccess: () => { utils.template.listTemplates.invalidate(); utils.form.listForms.invalidate(); } });
    return { unpublishAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useCloneTemplate() {
    const utils = trpc.useUtils();
    const mutation = trpc.template.cloneTemplate.useMutation({ onSuccess: () => { utils.form.listForms.invalidate(); } });
    return { cloneTemplateAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}
