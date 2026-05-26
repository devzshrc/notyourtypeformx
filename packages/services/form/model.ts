import { z } from "zod";

export const createFormInput = z.object({
    title: z.string().max(50),
    description: z.string().max(300).optional(),
    createdBy: z.uuid(),
});
export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
    userId: z.uuid(),
    includeArchived: z.boolean().optional(),
});
export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const getFormByIdInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
});
export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;

export const updateFormInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
    title: z.string().max(50).optional(),
    description: z.string().max(300).optional(),
    welcomeTitle: z.string().max(120).optional(),
    welcomeDescription: z.string().optional(),
    endingTitle: z.string().max(120).optional(),
    endingDescription: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]).optional(),
    isTemplate: z.boolean().optional(),
    hiddenFields: z.array(z.string().max(100)).optional(),
    expiresAt: z.string().nullable().optional(),
    maxResponses: z.number().int().min(1).nullable().optional(),
    password: z.string().max(100).nullable().optional(),
});
export type UpdateFormInputType = z.infer<typeof updateFormInput>;

export const deleteFormInput = z.object({ formId: z.uuid(), userId: z.uuid() });
export type DeleteFormInputType = z.infer<typeof deleteFormInput>;

export const cloneFormInput = z.object({ formId: z.uuid(), userId: z.uuid() });
export type CloneFormInputType = z.infer<typeof cloneFormInput>;

export const archiveFormInput = z.object({ formId: z.uuid(), userId: z.uuid(), archive: z.boolean() });
export type ArchiveFormInputType = z.infer<typeof archiveFormInput>;

export const listPublicFormsInput = z.object({ onlyTemplates: z.boolean().optional() });
export type ListPublicFormsInputType = z.infer<typeof listPublicFormsInput>;

export const clonePublicFormInput = z.object({ formId: z.uuid(), userId: z.uuid() });
export type ClonePublicFormInputType = z.infer<typeof clonePublicFormInput>;
