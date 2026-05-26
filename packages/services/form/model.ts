import { z } from "zod";

export const createFormInput = z.object({
    title: z.string().max(50).describe("Title of the form"),
    description: z.string().max(300).optional().describe("Description of the form"),
    createdBy: z.uuid().describe("UUID of the creator"),
});
export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
    userId: z.uuid().describe("UUID of the user"),
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
});
export type UpdateFormInputType = z.infer<typeof updateFormInput>;

export const deleteFormInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
});
export type DeleteFormInputType = z.infer<typeof deleteFormInput>;
