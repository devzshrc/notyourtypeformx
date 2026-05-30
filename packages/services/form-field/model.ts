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

// Per-field validation rules (all optional). pattern is a user-supplied regex source.
export const fieldValidationSchema = z
    .object({
        minLength: z.number().int().min(0).max(10000).optional(),
        maxLength: z.number().int().min(1).max(10000).optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().max(300).optional(),
    })
    .nullable()
    .optional();

export const addFieldInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
    label: z.string().max(100),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    isRequired: z.boolean().default(false),
    index: z.number().int().min(0),
    type: fieldTypeSchema,
    options: z.array(z.string().max(200)).optional(),
    logic: z.array(z.object({ equals: z.string(), goTo: z.string() })).optional(),
    scores: z.record(z.string(), z.number()).optional(),
    validation: fieldValidationSchema,
});
export type AddFieldInputType = z.infer<typeof addFieldInput>;

export const listFieldsInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
});
export type ListFieldsInputType = z.infer<typeof listFieldsInput>;

export const updateFieldInput = z.object({
    fieldId: z.uuid(),
    formId: z.uuid(),
    userId: z.uuid(),
    label: z.string().max(100).optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    isRequired: z.boolean().optional(),
    index: z.number().int().min(0).optional(),
    type: fieldTypeSchema.optional(),
    options: z.array(z.string().max(200)).optional(),
    logic: z.array(z.object({ equals: z.string(), goTo: z.string() })).optional(),
    scores: z.record(z.string(), z.number()).optional(),
    validation: fieldValidationSchema,
});
export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const deleteFieldInput = z.object({
    fieldId: z.uuid(),
    formId: z.uuid(),
    userId: z.uuid(),
});
export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const reorderFieldsInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
    fieldIds: z.array(z.uuid()),
});
export type ReorderFieldsInputType = z.infer<typeof reorderFieldsInput>;
