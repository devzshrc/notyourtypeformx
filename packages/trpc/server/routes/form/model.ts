import { z } from "zod";

export const createFormInputModel = z.object({ title: z.string().max(55), description: z.string().max(300).optional(), workspaceId: z.string().uuid().optional() });
export const createFormOutputModel = z.object({ id: z.string() });

export const listFormsInputModel = z.object({ includeArchived: z.boolean().optional(), workspaceId: z.string().uuid().optional() }).optional();
export const listFormOutputModel = z.array(z.object({
    id: z.string(), title: z.string(), description: z.string().nullable().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]), visibility: z.enum(["PUBLIC", "UNLISTED"]),
    isTemplate: z.boolean(), isArchived: z.boolean(), createdAt: z.date().nullable(), updatedAt: z.date().nullable(),
    workspaceId: z.string().nullable().optional(),
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
    hasPassword: z.boolean(), isArchived: z.boolean(),
    theme: z.string().nullable().optional(),
    redirectUrl: z.string().nullable().optional(),
    notifyEmail: z.string().nullable().optional(),
    webhookUrl: z.string().nullable().optional(),
    closedMessage: z.string().nullable().optional(),
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
    notifyEmail: z.string().max(200).nullable().optional(),
    webhookUrl: z.string().max(500).nullable().optional(),
    closedMessage: z.string().max(500).nullable().optional(),
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

export const importGoogleFormInputModel = z.object({ url: z.string().url().max(2000), workspaceId: z.string().uuid().optional() });
export const importGoogleFormOutputModel = z.object({ id: z.string(), importedCount: z.number(), skipped: z.array(z.string()) });

export const improveFieldInputModel = z.object({ fieldId: z.string().uuid() });
export const improveFieldOutputModel = z.object({ label: z.string() });

export const updateSlugInputModel = z.object({ formId: z.string().uuid(), slug: z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
export const updateSlugOutputModel = z.object({ slug: z.string() });

export const getFormBySlugInputModel = z.object({ slug: z.string().min(3).max(80) });
export const getFormBySlugOutputModel = z.object({ id: z.string(), title: z.string(), description: z.string().nullable().optional(), theme: z.string().nullable().optional(), slug: z.string().nullable().optional(), fields: z.array(z.any()) }).passthrough();

export const suggestFieldsInputModel = z.object({ formId: z.string().uuid() });
export const suggestFieldsOutputModel = z.object({ suggestions: z.array(z.object({ label: z.string(), type: z.string(), isRequired: z.boolean(), reasoning: z.string() })) });

export const moveFormInputModel = z.object({ formId: z.string().uuid(), workspaceId: z.string().uuid().nullable() });
export const moveFormOutputModel = z.object({ id: z.string() });
