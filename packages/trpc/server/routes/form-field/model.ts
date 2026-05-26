import { z } from "zod";

const fieldTypeSchema = z.enum([
    "TEXT",
    "EMAIL",
    "NUMBER",
    "YES_NO",
    "PASSWORD",
    "LONG_TEXT",
    "MULTIPLE_CHOICE",
    "CHECKBOXES",
    "DROPDOWN",
    "RATING",
    "DATE",
    "PHONE",
    "WEBSITE",
    "STATEMENT",
]);

export const addFieldInputModel = z.object({
    formId: z.string().uuid(),
    label: z.string().max(100),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    isRequired: z.boolean().default(false),
    index: z.number().int().min(0),
    type: fieldTypeSchema,
    options: z.array(z.string().max(200)).optional(),
    logic: z.array(z.object({ equals: z.string(), goTo: z.string() })).optional(),
    scores: z.record(z.string(), z.number()).optional(),
});
export const addFieldOutputModel = z.object({ id: z.string() });

export const listFieldsInputModel = z.object({ formId: z.string().uuid() });
export const listFieldsOutputModel = z.array(
    z.object({
        id: z.string(),
        formId: z.string().nullable(),
        label: z.string(),
        labelKey: z.string(),
        description: z.string().nullable(),
        placeholder: z.string().nullable(),
        isRequired: z.boolean(),
        index: z.string(),
        type: fieldTypeSchema,
        options: z.array(z.string()),
        logic: z.array(z.object({ equals: z.string(), goTo: z.string() })).nullable(),
        scores: z.record(z.string(), z.number()).nullable(),
        createdAt: z.date().nullable(),
        updatedAt: z.date().nullable(),
    }),
);

export const updateFieldInputModel = z.object({
    fieldId: z.string().uuid(),
    formId: z.string().uuid(),
    label: z.string().max(100).optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    isRequired: z.boolean().optional(),
    index: z.number().int().min(0).optional(),
    type: fieldTypeSchema.optional(),
    options: z.array(z.string().max(200)).optional(),
    logic: z.array(z.object({ equals: z.string(), goTo: z.string() })).optional(),
    scores: z.record(z.string(), z.number()).optional(),
});
export const updateFieldOutputModel = z.object({ id: z.string() });

export const deleteFieldInputModel = z.object({
    fieldId: z.string().uuid(),
    formId: z.string().uuid(),
});
export const deleteFieldOutputModel = z.object({ id: z.string() });

export const reorderFieldsInputModel = z.object({
    formId: z.string().uuid(),
    fieldIds: z.array(z.string().uuid()),
});
export const reorderFieldsOutputModel = z.object({ success: z.boolean() });
