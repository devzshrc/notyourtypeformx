import { z } from "zod";

export const listTemplatesInput = z.object({
    categoryId: z.string().uuid().optional(),
    search: z.string().max(100).optional(),
    limit: z.number().int().min(1).max(50).optional(),
    offset: z.number().int().min(0).optional(),
});
export type ListTemplatesInputType = z.infer<typeof listTemplatesInput>;

export const getTemplateInput = z.object({ templateId: z.string().uuid() });
export type GetTemplateInputType = z.infer<typeof getTemplateInput>;

export const publishAsTemplateInput = z.object({ formId: z.string().uuid(), userId: z.string().uuid(), categoryId: z.string().uuid() });
export type PublishAsTemplateInputType = z.infer<typeof publishAsTemplateInput>;

export const unpublishTemplateInput = z.object({ formId: z.string().uuid(), userId: z.string().uuid() });
export type UnpublishTemplateInputType = z.infer<typeof unpublishTemplateInput>;

export const cloneTemplateInput = z.object({ templateId: z.string().uuid(), userId: z.string().uuid(), workspaceId: z.string().uuid().optional() });
export type CloneTemplateInputType = z.infer<typeof cloneTemplateInput>;
