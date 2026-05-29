import { z } from "zod";

// Cap the raw submission payload so a single response can't bloat the DB / exhaust memory.
const MAX_SUBMISSION_BYTES = 100_000; // ~100 KB

export const submitFormInput = z.object({
    formId: z.uuid(),
    data: z
        .record(z.string(), z.unknown())
        .refine((d) => JSON.stringify(d).length <= MAX_SUBMISSION_BYTES, {
            message: "Submission payload is too large",
        }),
});
export type SubmitFormInputType = z.infer<typeof submitFormInput>;

export const listSubmissionsInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});
export type ListSubmissionsInputType = z.infer<typeof listSubmissionsInput>;

export const recordEventInput = z.object({
    formId: z.uuid(),
    type: z.enum(["VIEW", "START"]),
});
export type RecordEventInputType = z.infer<typeof recordEventInput>;

export const getAnalyticsInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
});
export type GetAnalyticsInputType = z.infer<typeof getAnalyticsInput>;

export const verifyFormPasswordInput = z.object({
    formId: z.string(),
    password: z.string(),
});
export type VerifyFormPasswordInputType = z.infer<typeof verifyFormPasswordInput>;

export const getAdminStatsInput = z.object({
    userId: z.uuid(),
});
export type GetAdminStatsInputType = z.infer<typeof getAdminStatsInput>;

export const getSubmissionTimeSeriesInput = z.object({
    formId: z.uuid(),
    userId: z.uuid(),
    days: z.number().int().min(1).max(90).optional(),
});
export type GetSubmissionTimeSeriesInputType = z.infer<typeof getSubmissionTimeSeriesInput>;
