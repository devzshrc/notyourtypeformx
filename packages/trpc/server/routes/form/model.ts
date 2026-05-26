import { z } from "zod";

// Create form
export const createFormInputModel = z.object({
    title: z.string().max(55),
    description: z.string().max(300).optional(),
});
export const createFormOutputModel = z.object({ id: z.string() });

// List forms
export const listFormsInputModel = z.undefined();
export const listFormOutputModel = z.array(
    z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable().optional(),
        createdAt: z.date().nullable(),
        updatedAt: z.date().nullable(),
    }),
);

// Get form
export const getFormInputModel = z.object({ formId: z.string().uuid() });
export const getFormOutputModel = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
});

// Update form
export const updateFormInputModel = z.object({
    formId: z.string().uuid(),
    title: z.string().max(55).optional(),
    description: z.string().max(300).optional(),
});
export const updateFormOutputModel = z.object({ id: z.string() });

// Delete form
export const deleteFormInputModel = z.object({ formId: z.string().uuid() });
export const deleteFormOutputModel = z.object({ id: z.string() });
