import { z } from "zod";

export const createFormInputModel = z.object({
    title: z.string().max(55).describe("Title of the form"),
    description: z.string().max(300).optional().describe("Description of the form"),
});

export const createFormOutputModel = z.object({
    id: z.string().describe("ID of the created form"),
});
export const listFormsInputModel = z.undefined();
export const listFormOutputModel = z.array(
    z.object({
        id: z.string().describe("ID of the form"),

        title: z.string().describe("Title of the form"),

        description: z.string().nullable().optional().describe("Description of the form"),

        createdAt: z.date().nullable().describe("Creation timestamp"),

        updatedAt: z.date().nullable().describe("Last updated timestamp"),
    }),
);
