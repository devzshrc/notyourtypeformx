import { z } from "zod";

export const listCategoriesInputModel = z.void().optional();
export const listCategoriesOutputModel = z.array(z.object({ id: z.string(), name: z.string(), slug: z.string(), description: z.string().nullable(), icon: z.string().nullable(), index: z.string(), createdAt: z.date().nullable() }));

export const listTemplatesInputModel = z.object({ categoryId: z.string().uuid().optional(), search: z.string().max(100).optional(), limit: z.number().int().min(1).max(50).optional(), offset: z.number().int().min(0).optional() }).optional();
export const listTemplatesOutputModel = z.object({ templates: z.array(z.object({ id: z.string(), title: z.string(), description: z.string().nullable(), slug: z.string().nullable(), categoryId: z.string().nullable(), isSystemTemplate: z.boolean(), templateCloneCount: z.number(), createdAt: z.date().nullable(), creatorName: z.string().nullable() })), total: z.number() });

export const getTemplateInputModel = z.object({ templateId: z.string().uuid() });
export const getTemplateOutputModel = z.object({ id: z.string(), title: z.string(), description: z.string().nullable(), theme: z.string().nullable(), fields: z.array(z.object({ id: z.string(), label: z.string(), type: z.string(), isRequired: z.boolean() })) }).passthrough();

export const publishAsTemplateInputModel = z.object({ formId: z.string().uuid(), categoryId: z.string().uuid() });
export const publishAsTemplateOutputModel = z.object({ id: z.string() });

export const unpublishTemplateInputModel = z.object({ formId: z.string().uuid() });
export const unpublishTemplateOutputModel = z.object({ success: z.boolean() });

export const cloneTemplateInputModel = z.object({ templateId: z.string().uuid(), workspaceId: z.string().uuid().optional() });
export const cloneTemplateOutputModel = z.object({ id: z.string() });
