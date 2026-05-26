import { z } from "zod";

export const submitFormInputModel = z.object({
    formId: z.string().uuid(),
    data: z.record(z.string(), z.unknown()),
});
export const submitFormOutputModel = z.object({ id: z.string() });

export const listSubmissionsInputModel = z.object({ formId: z.string().uuid() });
export const listSubmissionsOutputModel = z.array(
    z.object({
        id: z.string(),
        formId: z.string(),
        data: z.unknown(),
        createdAt: z.date().nullable(),
    }),
);

export const getPublicFormInputModel = z.object({ formId: z.string().uuid() });
export const getPublicFormOutputModel = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    fields: z.array(
        z.object({
            id: z.string(),
            label: z.string(),
            labelKey: z.string(),
            description: z.string().nullable(),
            placeholder: z.string().nullable(),
            isRequired: z.boolean(),
            type: z.enum(["TEXT", "EMAIL", "NUMBER", "YES_NO", "PASSWORD"]),
            index: z.string(),
        }),
    ),
});
