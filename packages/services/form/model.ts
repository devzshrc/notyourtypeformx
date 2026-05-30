import { z } from "zod";

export const createFormInput = z.object({
    title: z.string().max(50),
    description: z.string().max(300).optional(),
    createdBy: z.uuid(),
    workspaceId: z.uuid().optional(),
});
export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
    userId: z.uuid(),
    includeArchived: z.boolean().optional(),
    workspaceId: z.uuid().optional(),
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
    theme: z.string().max(50).optional(),
    redirectUrl: z
        .string()
        .max(500)
        .refine(
            (u) => {
                try {
                    const proto = new URL(u).protocol;
                    return proto === "http:" || proto === "https:";
                } catch {
                    return false;
                }
            },
            { message: "Redirect URL must be a valid http(s) URL" },
        )
        .nullable()
        .optional(),
    notifyEmail: z.string().email().max(200).nullable().optional(),
    webhookUrl: z
        .string()
        .max(500)
        .refine(
            (u) => {
                try {
                    const proto = new URL(u).protocol;
                    return proto === "http:" || proto === "https:";
                } catch {
                    return false;
                }
            },
            { message: "Webhook URL must be a valid http(s) URL" },
        )
        .nullable()
        .optional(),
    closedMessage: z.string().max(500).nullable().optional(),
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

export const updateSlugInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
    slug: z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
});
export type UpdateSlugInputType = z.infer<typeof updateSlugInput>;

export const getFormBySlugInput = z.object({ slug: z.string().min(3).max(80) });
export type GetFormBySlugInputType = z.infer<typeof getFormBySlugInput>;

export const moveFormInput = z.object({ formId: z.uuid(), userId: z.uuid(), workspaceId: z.uuid().nullable() });
export type MoveFormInputType = z.infer<typeof moveFormInput>;
