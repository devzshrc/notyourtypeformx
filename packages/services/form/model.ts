import { z } from "zod";

export const createFormInput = z.object({
    title: z.string().max(50).describe("Title of the form"),
    description: z.string().max(300).optional().describe("Description of the form"),
    createdBy: z.uuid().describe("UUID of the creator"),
});

export type createFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
    userId: z.uuid().describe("UUID of the user"),
});
export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;
