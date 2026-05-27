import { z } from "zod";

export const createFormInputModel = z.object({ title: z.string().max(55), description: z.string().max(300).optional() });
export const createFormOutputModel = z.object({ id: z.string() });

export const listFormsInputModel = z.object({ includeArchived: z.boolean().optional() }).optional();
export const listFormOutputModel = z.array(z.object({
    id: z.string(), title: z.string(), description: z.string().nullable().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]), visibility: z.enum(["PUBLIC", "UNLISTED"]),
    isTemplate: z.boolean(), isArchived: z.boolean(), createdAt: z.date().nullable(), updatedAt: z.date().nullable(),
}));

export const getFormInputModel = z.object({ formId: z.string().uuid() });
export const getFormOutputModel = z.object({
    id: z.string(), title: z.string(), description: z.string().nullable().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]), visibility: z.enum(["PUBLIC", "UNLISTED"]),
    isTemplate: z.boolean(), slug: z.string().nullable().optional(),
    hiddenFields: z.array(z.string()).nullable().optional(),
    welcomeTitle: z.string().nullable().optional(), welcomeDescription: z.string().nullable().optional(),
    endingTitle: z.string().nullable().optional(), endingDescription: z.string().nullable().optional(),
    expiresAt: z.date().nullable().optional(), maxResponses: z.number().nullable().optional(),
    password: z.string().nullable().optional(), isArchived: z.boolean(),
    theme: z.string().nullable().optional(),
    redirectUrl: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(), createdAt: z.date().nullable(), updatedAt: z.date().nullable(),
});

export const updateFormInputModel = z.object({
    formId: z.string().uuid(), title: z.string().max(55).optional(), description: z.string().max(300).optional(),
    welcomeTitle: z.string().max(120).optional(), welcomeDescription: z.string().optional(),
    endingTitle: z.string().max(120).optional(), endingDescription: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(), visibility: z.enum(["PUBLIC", "UNLISTED"]).optional(),
    isTemplate: z.boolean().optional(), hiddenFields: z.array(z.string().max(100)).optional(),
    expiresAt: z.string().nullable().optional(), maxResponses: z.number().int().min(1).nullable().optional(),
    password: z.string().max(100).nullable().optional(),
    theme: z.string().max(50).optional(),
    redirectUrl: z.string().max(500).nullable().optional(),
});
export const updateFormOutputModel = z.object({ id: z.string() });

export const deleteFormInputModel = z.object({ formId: z.string().uuid() });
export const deleteFormOutputModel = z.object({ id: z.string() });

export const cloneFormInputModel = z.object({ formId: z.string().uuid() });
export const cloneFormOutputModel = z.object({ id: z.string() });

export const archiveFormInputModel = z.object({ formId: z.string().uuid(), archive: z.boolean() });
export const archiveFormOutputModel = z.object({ id: z.string() });

export const listPublicFormsInputModel = z.object({ onlyTemplates: z.boolean().optional() }).optional();
export const listPublicFormsOutputModel = z.array(z.object({
    id: z.string(), title: z.string(), description: z.string().nullable().optional(),
    slug: z.string().nullable().optional(), isTemplate: z.boolean(),
    createdAt: z.date().nullable(), creatorName: z.string().nullable().optional(),
}));

export const clonePublicFormInputModel = z.object({ formId: z.string().uuid() });
export const clonePublicFormOutputModel = z.object({ id: z.string() });

export const generateFormInputModel = z.object({ prompt: z.string().min(10).max(500) });
export const generateFormOutputModel = z.object({ id: z.string().uuid() });

export const improveFieldInputModel = z.object({ fieldId: z.string().uuid() });
export const improveFieldOutputModel = z.object({ label: z.string() });
