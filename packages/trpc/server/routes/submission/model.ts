import { z } from "zod";

export const submitFormInputModel = z.object({
    formId: z.string().uuid(),
    data: z.record(z.string(), z.unknown()),
});
export const submitFormOutputModel = z.object({ id: z.string() });

export const recordEventInputModel = z.object({
    formId: z.string().uuid(),
    type: z.enum(["VIEW", "START"]),
});
export const recordEventOutputModel = z.object({ success: z.boolean() });

export const getAnalyticsInputModel = z.object({ formId: z.string().uuid() });
export const getAnalyticsOutputModel = z.object({
    views: z.number(),
    starts: z.number(),
    submissions: z.number(),
    completionRate: z.number(),
});

export const listSubmissionsInputModel = z.object({ formId: z.string().uuid() });
export const listSubmissionsOutputModel = z.array(
    z.object({
        id: z.string(),
        formId: z.string(),
        data: z.unknown(),
        createdAt: z.date().nullable(),
    }),
);

export const getPublicFormInputModel = z.object({ formId: z.string() });
export const getPublicFormOutputModel = z.object({
    id: z.string(),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    slug: z.string().nullable().optional(),
    hiddenFields: z.array(z.string()).nullable().optional(),
    title: z.string(),
    description: z.string().nullable().optional(),
    welcomeTitle: z.string().nullable().optional(),
    welcomeDescription: z.string().nullable().optional(),
    endingTitle: z.string().nullable().optional(),
    endingDescription: z.string().nullable().optional(),
    fields: z.array(
        z.object({
            id: z.string(),
            label: z.string(),
            labelKey: z.string(),
            description: z.string().nullable(),
            placeholder: z.string().nullable(),
            isRequired: z.boolean(),
            type: z.enum([
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
            ]),
            index: z.string(),
            options: z.array(z.string()),
            logic: z.array(z.object({ equals: z.string(), goTo: z.string() })).nullable(),
            scores: z.record(z.string(), z.number()).nullable(),
        }),
    ),
});
